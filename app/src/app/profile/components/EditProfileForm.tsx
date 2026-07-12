"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { postUpdateProfileAction } from "@/app/actions";
import { toast } from "sonner";

interface Link {
  title: string;
  url: string;
}

interface Profile {
  name: string;
  email: string;
  description: string;
  links: Link[];
}

const EditProfileForm = ({
  profile,
  setIsEditing,
}: {
  profile: Profile | null;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [updatedProfile, setUpdatedProfile] = useState<Profile>(
    profile || {
      name: "",
      email: "",
      description: "",
      links: [],
    },
  );
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const fullNameRegex = /^[a-zA-Z][a-zA-Z\s'-]{1,49}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      setNameError(
        value.trim() === "" || fullNameRegex.test(value.trim())
          ? ""
          : "Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes.",
      );
    }
    if (name === "email") {
      setEmailError(
        value.trim() === "" || emailRegex.test(value.trim())
          ? ""
          : "Please enter a valid email address.",
      );
    }
  };

  const handleLinkChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const newLinks = [...updatedProfile.links];
    newLinks[index] = { ...newLinks[index], [name]: value };
    setUpdatedProfile((prev) => ({ ...prev, links: newLinks }));
  };

  const addLink = () => {
    setUpdatedProfile((prev) => ({
      ...prev,
      links: [...prev.links, { title: "", url: "" }],
    }));
  };

  const removeLink = (index: number) => {
    const newLinks = updatedProfile.links.filter((_, i) => i !== index);
    setUpdatedProfile((prev) => ({ ...prev, links: newLinks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameRegex.test(updatedProfile.name.trim())) {
      setNameError(
        "Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes.",
      );
      return;
    }
    if (!emailRegex.test(updatedProfile.email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    const response = await postUpdateProfileAction(updatedProfile);
    if (response.success) {
      // Handle success (e.g., show a success message, redirect, etc.)
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } else {
      // Handle error (e.g., show an error message)
      toast.error(response.message || "Failed to update profile");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg bg-zinc-700/50 p-6 shadow-md"
    >
      <h2 className="text-2xl font-bold text-zinc-200">Edit Profile</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-zinc-300"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={updatedProfile.name}
            onChange={handleProfileChange}
            className="mt-1 block w-full rounded-md border outline-none p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {nameError && (
            <span className="text-red-400 text-sm">{nameError}</span>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-zinc-300"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={updatedProfile.email}
            onChange={handleProfileChange}
            className="mt-1 block w-full rounded-md border outline-none p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {emailError && (
            <span className="text-red-400 text-sm">{emailError}</span>
          )}
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-zinc-300"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={updatedProfile.description}
            onChange={handleProfileChange}
            className="mt-1 block w-full rounded-md border outline-none p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-zinc-300">Custom Links</h3>
        {updatedProfile.links.map((link, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={link.title}
              onChange={(e) => handleLinkChange(index, e)}
              className="block w-1/3 rounded-md outline-none p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <input
              type="url"
              name="url"
              placeholder="URL"
              value={link.url}
              onChange={(e) => handleLinkChange(index, e)}
              className="block w-2/3 rounded-md outline-none p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="text-gray-500 focus:text-red-600 outline-none hover:text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLink}
          className="flex items-center space-x-2 rounded-md border border-dashed border-gray-400 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <Plus size={16} />
          <span>Add Link</span>
        </button>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!!nameError || !!emailError}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
