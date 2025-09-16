import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// FastAPI Backend Configuration  
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";


// Trigger AI content generation and PDF creation
export const generateBrochure = action({
  args: {
    jobId: v.id("jobs"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, { jobId, projectId }): Promise<any> => {
    try {
      // Update job status to running
      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "running",
        progress: 10,
      });

      // Get project data (skip auth for local development)
      const project = await ctx.runQuery(api.projects.getById, { 
        projectId,
        includeAssets: true,
        // For local development - we'll get the user from the project
      });
      
      if (!project) {
        throw new Error("Project not found");
      }
      
      
      // Get the user who owns this project to get their clerkId
      const projectOwner = await ctx.runQuery(api.users.getById, { 
        userId: project.userId 
      });
      

      // Get project assets (skip auth for local development)
      const assets = await ctx.runQuery(api.assets.getProjectAssets, { 
        projectId,
        // For local development - actions don't have user context
      });

      // Prepare asset URLs
      const assetUrls: Record<string, string> = {};
      for (const asset of assets) {
        if (asset.isLogo) {
          const url = await ctx.runQuery(api.assets.getAssetUrl, { 
            storageId: asset.storageId 
          });
          if (url) {
            assetUrls["logo"] = url;
          }
        } else {
          // Non-logo assets are treated as hero images
          const url = await ctx.runQuery(api.assets.getAssetUrl, { 
            storageId: asset.storageId 
          });
          if (url) {
            assetUrls["hero"] = url;
          }
        }
      }

      // Update progress
      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "running",
        progress: 25,
      });

      // Step 1: Generate AI content
      const aiResponse = await generateAIContent(project, assetUrls);
      
      // Update progress
      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "running", 
        progress: 60,
      });

      // Step 2: Generate PDF
      const renderResponse = await generatePDF({
        projectId,
        jobId,
        copyData: aiResponse.copy_data,
        assets: assetUrls,
      });

      // Update progress
      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "running",
        progress: 85,
      });

      // Step 3: Store render results in Convex
      const renderData: any = {
        jobId,
        projectId,
        copyData: aiResponse.copy_data,
        layoutData: {
          template: "product_a",
          palette: { primary: "#2563eb" }
        },
        pdfUrl: renderResponse?.pdf_url || "pending",
        clerkId: projectOwner?.clerkId, // Pass clerkId for local development auth bypass
      };
      
      // Only include pngUrl if it exists (Convex optional fields need undefined, not null)
      if (renderResponse?.png_url) {
        renderData.pngUrl = renderResponse.png_url;
      }
      
      const renderId: any = await ctx.runMutation(api.renders.create, renderData);
      

      // Update job as completed
      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "done",
        progress: 100,
        resultId: renderId,
      });

      return {
        success: true,
        renderId,
        message: "Brochure generated successfully"
      };

    } catch (error) {
      console.error("FastAPI generation error:", error);
      
      // Update job as failed
      await ctx.runMutation(api.jobs.updateStatus, {
        jobId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

// Helper function to call FastAPI AI generation
async function generateAIContent(project: any, assets: Record<string, string>) {
  const requestBody = {
    business_info: {
      name: project.businessInfo.name,
      type: project.businessInfo.type,
      description: `${project.businessInfo.name} - ${project.businessInfo.type}`,
      target_audience: project.businessInfo.audience || "General audience",
      key_benefits: project.features.map((f: any) => f.title)
    },
    selected_features: project.features.map((f: any) => f.title)
  };


  const response = await fetch(`${FASTAPI_BASE_URL}/api/ai/generate-copy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Clerk JWT token for authentication
      // "Authorization": `Bearer ${clerkToken}`,
    },
    body: JSON.stringify(requestBody),
  });


  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI generation failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to call FastAPI PDF generation
async function generatePDF(params: {
  projectId: string;
  jobId: string;
  copyData: any;
  assets: Record<string, string>;
}) {
  const requestBody = {
    project_id: params.projectId,
    job_id: params.jobId,
    copy_data: params.copyData,
    assets: params.assets,
    template: "product_a"
  };

  const response = await fetch(`${FASTAPI_BASE_URL}/api/render/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Clerk JWT token for authentication
      // "Authorization": `Bearer ${clerkToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDF generation failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Health check for FastAPI backend
export const healthCheck = action({
  args: {},
  handler: async () => {
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const health = await response.json();
      return {
        status: "healthy",
        backend: health,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now()
      };
    }
  },
});
