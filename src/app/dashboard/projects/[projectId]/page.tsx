"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  flows: Flow[];
  tokens: Token[];
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface Token {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface ProjectProps {
  projectId: string;
}

function ProjectPageClient({ projectId }: ProjectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("flows");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Fetch project data
    if (status === "authenticated") {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          
          if (response.ok) {
            const data = await response.json();
            // Ensure flows and tokens always have at least empty arrays
            setProject({
              ...data.project,
              flows: data.project.flows || [],
              tokens: data.project.tokens || []
            });
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch project");
          }
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("An error occurred while fetching the project");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProject();
    }
  }, [projectId, status, router]);

  const deleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone and will delete all flows and tokens associated with this project.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred while deleting the project");
      }
      setIsDeleting(false);
    }
  };

  const deleteFlow = async (flowId: string) => {
    if (!confirm("Are you sure you want to delete this flow? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update the project state to remove the deleted flow
        if (project) {
          setProject({
            ...project,
            flows: project.flows.filter(flow => flow.id !== flowId)
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete flow");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred while deleting the flow");
      }
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                  IVR Designer
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/tokens"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tokens
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back to Projects
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            </div>
            <button
              onClick={deleteProject}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
          </div>

          {project.description && (
            <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-md p-4">
              <h2 className="text-sm font-medium text-gray-500">Description</h2>
              <p className="mt-1 text-sm text-gray-900">{project.description}</p>
            </div>
          )}

          {/* Project Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("flows")}
                className={`${
                  activeTab === "flows" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Authentication Flows
              </button>
              <button
                onClick={() => setActiveTab("tokens")}
                className={`${
                  activeTab === "tokens" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Tokens
              </button>
            </nav>
          </div>

          {/* Flows Section */}
          {activeTab === "flows" && (
            <div id="flows" className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-900">Authentication Flows</h2>
                <Link
                  href={`/dashboard/projects/${projectId}/flows/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Flow
                </Link>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {project.flows.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-500 mb-4">No authentication flows have been created yet.</p>
                    <Link
                      href={`/dashboard/projects/${projectId}/flows/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      Create your first authentication flow
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {project.flows.map((flow) => (
                      <li key={flow.id}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/dashboard/projects/${projectId}/flows/${flow.id}/designer`}
                                className="text-lg font-medium text-blue-600 truncate"
                              >
                                {flow.name}
                              </Link>
                              <div className="ml-2 flex-shrink-0 flex space-x-2">
                                <Link
                                  href={`/dashboard/projects/${projectId}/flows/${flow.id}/designer`}
                                  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                                >
                                  Edit
                                </Link>
                                <Link
                                  href={`/dashboard/projects/${projectId}/flows/${flow.id}/simple-designer`}
                                  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                                >
                                  Simple Edit
                                </Link>
                                <button
                                  onClick={() => deleteFlow(flow.id)}
                                  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {flow.description || "No description"}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  Created on{" "}
                                  {new Date(flow.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Tokens Section */}
          {activeTab === "tokens" && (
            <div id="tokens" className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-900">Authentication Tokens</h2>
                <Link
                  href={`/dashboard/projects/${projectId}/tokens`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Manage Tokens
                </Link>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {project.tokens.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-500 mb-4">No authentication tokens have been created yet.</p>
                    <Link
                      href={`/dashboard/projects/${projectId}/tokens`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      Create your first authentication token
                    </Link>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {project.tokens.map((token) => (
                        <tr key={token.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{token.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{token.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{token.description || "N/A"}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Page({ params }: { params: { projectId: string } }) {
  return <ProjectPageClient projectId={params.projectId} />;
} 