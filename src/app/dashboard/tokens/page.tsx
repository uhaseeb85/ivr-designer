"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TokenType = "SSN" | "PIN" | "ACCOUNT_NUMBER" | "DEBIT_CARD" | "DOB" | "PASSWORD" | "OTHER";

interface Token {
  id: string;
  name: string;
  type: TokenType;
  description?: string;
  format?: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TokensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newToken, setNewToken] = useState({
    name: "",
    type: "SSN" as TokenType,
    description: "",
    format: "",
    projectId: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Fetch tokens and projects
    if (status === "authenticated") {
      const fetchData = async () => {
        try {
          console.log("Fetching tokens data...");
          
          // Fetch tokens
          const tokensResponse = await fetch("/api/tokens");
          console.log("Tokens response status:", tokensResponse.status);
          
          if (!tokensResponse.ok) {
            const errorData = await tokensResponse.json();
            console.error("Tokens API error:", errorData);
            throw new Error(errorData.error || "Failed to fetch tokens");
          }
          
          const tokensData = await tokensResponse.json();
          console.log("Tokens data received:", tokensData);
          
          // Fetch projects for the token creation form
          const projectsResponse = await fetch("/api/projects");
          console.log("Projects response status:", projectsResponse.status);
          
          if (!projectsResponse.ok) {
            const errorData = await projectsResponse.json();
            console.error("Projects API error:", errorData);
            throw new Error(errorData.error || "Failed to fetch projects");
          }
          
          const projectsData = await projectsResponse.json();
          console.log("Projects data received:", projectsData);
          
          setTokens(tokensData.tokens || []);
          console.log("Tokens set:", tokensData.tokens?.length || 0);
          
          setProjects(projectsData.projects || []);
          console.log("Projects set:", projectsData.projects?.length || 0);
          
          // Set default project if available
          if (projectsData.projects && projectsData.projects.length > 0) {
            setNewToken(prev => ({...prev, projectId: projectsData.projects[0].id}));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("An error occurred while fetching data");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [status, router]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newToken.name || !newToken.type || !newToken.projectId) {
      setError("Name, type, and project are required");
      return;
    }
    
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newToken),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create token");
      }
      
      // Refresh token list
      const tokensResponse = await fetch("/api/tokens");
      const tokensData = await tokensResponse.json();
      setTokens(tokensData.tokens || []);
      
      // Reset form
      setNewToken({
        name: "",
        type: "SSN",
        description: "",
        format: "",
        projectId: projects.length > 0 ? projects[0].id : ""
      });
      
      setIsCreating(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
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
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/tokens"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
            <h1 className="text-2xl font-semibold text-gray-900">Authentication Tokens</h1>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              New Token
            </button>
          </div>

          {/* Create Token Form */}
          {isCreating && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-medium mb-4">Create New Token</h2>
              {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Token Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newToken.name}
                      onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Token Type *
                    </label>
                    <select
                      id="type"
                      value={newToken.type}
                      onChange={(e) => setNewToken({...newToken, type: e.target.value as TokenType})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="SSN">Social Security Number (SSN)</option>
                      <option value="PIN">PIN</option>
                      <option value="ACCOUNT_NUMBER">Account Number</option>
                      <option value="DEBIT_CARD">Debit Card Number</option>
                      <option value="DOB">Date of Birth</option>
                      <option value="PASSWORD">Password</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                      Project *
                    </label>
                    <select
                      id="project"
                      value={newToken.projectId}
                      onChange={(e) => setNewToken({...newToken, projectId: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      {projects.length === 0 && (
                        <option value="" disabled>No projects available</option>
                      )}
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                      Format
                    </label>
                    <input
                      type="text"
                      id="format"
                      value={newToken.format}
                      onChange={(e) => setNewToken({...newToken, format: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g. XXX-XX-XXXX for SSN"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newToken.description}
                      onChange={(e) => setNewToken({...newToken, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Token
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tokens List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {tokens.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-500 mb-4">You don't have any tokens yet.</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Create your first token
                </button>
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
                      Format
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tokens.map((token) => (
                    <tr key={token.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{token.name}</div>
                        {token.description && (
                          <div className="text-sm text-gray-500">{token.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {token.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {token.format || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {token.project?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/dashboard/projects/${token.projectId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Project
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 