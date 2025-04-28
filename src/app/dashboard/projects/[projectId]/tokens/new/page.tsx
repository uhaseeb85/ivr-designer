"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TokenPageProps {
  params: {
    projectId: string;
  };
}

export default function NewTokenPage({ params }: TokenPageProps) {
  const { projectId } = params;
  const { status } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [type, setType] = useState("SSN");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Token type options
  const tokenTypes = [
    { id: "SSN", name: "Social Security Number" },
    { id: "PIN", name: "PIN Number" },
    { id: "ACCOUNT", name: "Account Number" },
    { id: "DOB", name: "Date of Birth" },
    { id: "CARD", name: "Card Number" },
    { id: "CUSTOM", name: "Custom Token" },
  ];

  // Check authentication
  if (status === "unauthenticated") {
    router.push("/login");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          description,
          format,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create token");
      }

      // Redirect back to the project page
      router.push(`/dashboard/projects/${projectId}#tokens`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred while creating the token");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-center mb-6">
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="text-blue-600 hover:text-blue-800 mr-2"
            >
              ← Back to Project
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Add Authentication Token</h1>
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
                  Token Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter token name (e.g. Customer SSN)"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {tokenTypes.map((tokenType) => (
                    <option key={tokenType.id} value={tokenType.id}>
                      {tokenType.name}
                    </option>
                  ))}
                </select>
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter token description"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="format"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Validation Format
                </label>
                <input
                  type="text"
                  id="format"
                  name="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter validation format (e.g. regex pattern)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Enter a regex pattern or other validation format for this token.
                </p>
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
                  disabled={loading || !name || !type}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 