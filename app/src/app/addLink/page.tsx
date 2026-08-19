"use client";
import { useEffect, useMemo, useState } from "react";
import AddNewCategory from "@/app/components/AddNewCategory";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getCategoriesAction,
  postAddURLAction,
  getLinkDataAction,
  putEditURLAction,
} from "../actions";
import { ROUTES } from "@/config/constants";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
interface Category {
  id: string | null;
  name: string;
}

function AddLinkForm() {
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    category_id: "",
    new_category: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // on load fetch the link id from the url params and replace the url without the params
  const urlParams = useSearchParams();
  const linkId = urlParams.get("linkId");
  const categoryId = urlParams.get("categoryId");
  useEffect(() => {
    if (linkId) {
      const fetchLinkData = async () => {
        const response = await getLinkDataAction(linkId);
        if (!response.success) {
          toast.error(response.message);
          return;
        }
        const responseData = response.data;
        setFormData((prevData) => ({
          ...prevData,
          url: responseData.url,
          title: responseData.title,
          category_id: responseData.category_id,
          new_category: "",
        }));
        // Remove the query parameter from the URL
        // const newUrl = window.location.origin + window.location.pathname;
        // window.history.replaceState({}, document.title, newUrl);
      };
      fetchLinkData();
      setIsEditingLink(true);
    }
  }, [linkId]);
  useEffect(() => {
    if (categoryId) {
      setFormData((prevData) => ({
        ...prevData,
        category_id: categoryId,
      }));
    }
  }, [categoryId]);
  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAction();
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      if (response && Array.isArray(response.data)) {
        setCategoryList(response.data);
      } else {
        setCategoryList([]);
      }
    } catch (error) {
      setCategoryList([]);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.url ||
      !formData.title ||
      (!formData.category_id && !formData.new_category)
    ) {
      toast.error("All Fields are required");
      return;
    }
    const protocolRegex =
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    const noProtocolRegex =
      /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,63}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    console.log(new RegExp(noProtocolRegex).test(formData.url));
    if (
      !protocolRegex.test(formData.url) &&
      !noProtocolRegex.test(formData.url)
    ) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setIsSubmitting(true);
      var response;
      if (isEditingLink) {
        response = await putEditURLAction(formData, linkId!);
      } else {
        response = await postAddURLAction(formData);
      }

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setFormData({
        url: "",
        title: "",
        category_id: "",
        new_category: "",
      });
      // setMessage(response.message);
      router.push(ROUTES.HOME);
      toast.success(response.message);
    } catch (error) {
      console.error("Error adding link:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const selectedCategoryName = useMemo(() => {
    return categoryList.find((category) => category.id === formData.category_id)
      ?.name;
  }, [categoryList, formData.category_id]);
  const handleRemoveNewCategory = () => {
    setFormData((prevData) => ({
      ...prevData,
      new_category: "",
    }));
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <div className="">
      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-6">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href={ROUTES.HOME} className="flex items-center gap-1">
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.6)]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Add a new link
            </h2>
            <p className="text-sm text-zinc-400">
              Save it to the perfect collection in seconds.
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Link URL
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              id="url"
              placeholder="Paste your URL here"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-indigo-500/60"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Title
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              id="title"
              placeholder="Choose a title"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-indigo-500/60"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-zinc-300">Collection</span>
            {/* {!formData.new_category && (
              <SearchableDropdown
                options={categoryList.map((category) => ({
                  label: category.name,
                  value: category.id || "",
                }))}
                label="label"
                id="category-dropdown"
                selectedVal={formData.category_id}
                handleChange={(item) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    category_id: item?.value || "",
                    new_category: "",
                  }));
                }}
              />
            )} */}
            {!formData.new_category && (
              <SearchableDropdown
                options={categoryList.map((category) => ({
                  label: category.name,
                  value: category.id || "",
                  new_category: "",
                }))}
                selectedValue={formData.category_id}
                handleChange={(
                  item: { value?: string; new_category?: string } | null,
                ) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    category_id: item?.value || "",
                    new_category: item?.new_category || "",
                  }));
                }}
              />
            )}
            <div
              className={`${isAdding ? "flex flex-col gap-2" : "flex items-center justify-between"}`}
            >
              {/* {!formData.new_category && (
                <p className="text-xs text-zinc-400 mt-2">
                  {isAdding
                    ? "Creating a new Collection..."
                    : "Want to create a new Collection?"}
                </p>
              )}
              {!isAdding && !formData.new_category && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="text-xs text-indigo-500/80 hover:text-indigo-500 transition"
                >
                  Add new
                </button>
              )} */}
              {isAdding && (
                <AddNewCategory
                  setIsAdding={setIsAdding}
                  selectedCategory={formData.new_category}
                  setSelectedCategory={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      new_category: e.target.value,
                      category_id: "",
                    }))
                  }
                />
              )}
            </div>
            {formData.new_category && (
              <div className="flex items-center justify-between gap-4">
                <p className="mt-2 text-sm text-zinc-300">
                  New Collection:{" "}
                  <b className="text-base">
                    {selectedCategoryName || formData.new_category}
                  </b>
                </p>
                <p
                  onClick={handleRemoveNewCategory}
                  className="mt-2 text-xs text-red-300 cursor-pointer"
                >
                  Remove
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full border border-indigo-500/60 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditingLink
                ? "Update link"
                : "Save link"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function AddLinkPage() {
  return (
    <Suspense>
      <AddLinkForm />
    </Suspense>
  );
}
