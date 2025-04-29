"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description?: string;
}

export default function NewFlowPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useSimpleDesigner, setUseSimpleDesigner] = useState(false);

  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Fetch project details
    if (status === "authenticated" && projectId) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch project");
          }
          const data = await response.json();
          setProject(data.project);
        } catch (error) {
          console.error("Error fetching project:", error);
          router.push("/dashboard");
        } finally {
          setLoading(false);
        }
      };

      fetchProject();
    }
  }, [status, router, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create flow");
      }

      // Redirect to the chosen flow designer
      if (useSimpleDesigner) {
        router.push(`/dashboard/projects/${projectId}/flows/${data.flow.id}/simple-designer`);
      } else {
        router.push(`/dashboard/projects/${projectId}/flows/${data.flow.id}/designer`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred while creating the flow");
      }
    } finally {
      setSubmitting(false);
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

      {/* Project Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/dashboard" className="hover:text-gray-700">
                Dashboard
              </Link>
              <span>&gt;</span>
              <Link href={`/dashboard/projects/${projectId}`} className="hover:text-gray-700">
                {project?.name || "Project"}
              </Link>
              <span>&gt;</span>
              <span className="text-gray-900 font-medium">New Flow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create New Flow for {project?.name}
            </h1>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Flow Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter flow name"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter flow description"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="useSimpleDesigner"
                    name="useSimpleDesigner"
                    type="checkbox"
                    checked={useSimpleDesigner}
                    onChange={(e) => setUseSimpleDesigner(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useSimpleDesigner" className="ml-2 block text-sm text-gray-700">
                    Use simple flow designer (recommended for easier editing)
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href={`/dashboard/projects/${projectId}`}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !name}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Flow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 