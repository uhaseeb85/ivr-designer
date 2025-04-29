"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import SimpleFlowDesigner from "@/components/flow/SimpleFlowDesigner";

interface FlowDesignerProps {
  params: {
    projectId: string;
    flowId: string;
  };
}

export default function SimpleFlowDesignerPage({ params }: FlowDesignerProps) {
  const { projectId, flowId } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [flowName, setFlowName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [initialNodes, setInitialNodes] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load flow data
  useEffect(() => {
    if (status === "authenticated") {
      const fetchFlowData = async () => {
        try {
          // Fetch project data first
          const projectResponse = await fetch(`/api/projects/${projectId}`);
          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            setProjectName(projectData.project.name);
          }
          
          // Fetch flow data
          const flowResponse = await fetch(`/api/flows/${flowId}`);
          
          if (!flowResponse.ok) {
            throw new Error("Failed to fetch flow data");
          }
          
          const flowData = await flowResponse.json();
          setFlowName(flowData.flow.name);
          
          // Convert DB nodes to format needed by SimpleFlowDesigner
          const flowNodes = flowData.flow.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            title: node.title,
            prompt: node.prompt,
            position: node.position || 0, // Default position if not available
            tokenId: node.tokenId,
            validationRules: node.validationRules,
            nextNodeIds: node.nextNodeIds || [],
          }));
          
          // Sort nodes by position
          flowNodes.sort((a: any, b: any) => a.position - b.position);
          
          setInitialNodes(flowNodes);
          
          // Fetch tokens for the project
          const tokensResponse = await fetch(`/api/tokens?projectId=${projectId}`);
          
          if (tokensResponse.ok) {
            const tokensData = await tokensResponse.json();
            setTokens(tokensData.tokens);
          }
          
        } catch (error) {
          console.error("Error loading flow:", error);
          setError("Failed to load flow data");
        } finally {
          setLoading(false);
        }
      };
      
      fetchFlowData();
    }
  }, [flowId, projectId, status]);
  
  // Custom save handler for the flow
  const handleSaveFlow = async (nodes: any[]) => {
    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            title: node.title,
            prompt: node.prompt,
            position: node.position,
            tokenId: node.tokenId,
            validationRules: node.validationRules,
            nextNodeIds: node.nextNodeIds,
          })),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save flow");
      }
      
      // Navigate back to project page after save
      router.refresh();
      
    } catch (error) {
      console.error("Error saving flow:", error);
      throw error; // Rethrow to be handled by the SimpleFlowDesigner
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-indigo-800 font-medium">Loading your flow designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-cyan-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-transparent bg-clip-text hover:from-indigo-500 hover:to-cyan-500 transition-all">
                  IVR Designer
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="nav-link nav-link-inactive"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/tokens"
                  className="nav-link nav-link-inactive"
                >
                  Tokens
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="btn-outline btn-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Project
              </Link>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Project Navigation Breadcrumbs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href={`/dashboard/projects/${projectId}`} className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                      {projectName}
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="ml-1 text-indigo-600 font-medium md:ml-2">{flowName}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="mr-2">🎨</span>
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-transparent bg-clip-text">
                Designing: {flowName}
              </span>
            </h1>
            <div className="flex mt-3 sm:mt-0">
              <Link 
                href={`/dashboard/projects/${projectId}/flows/${flowId}/designer`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                Switch to Advanced Editor
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 p-5 h-[calc(100vh-220px)]"
          >
            {error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold">Error Loading Flow Data</h3>
                </div>
                <p className="mb-4">{error}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => router.refresh()}
                    className="btn-primary btn-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <SimpleFlowDesigner
                flowId={flowId}
                projectId={projectId}
                initialNodes={initialNodes}
                onSave={handleSaveFlow}
                tokens={tokens}
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
} 