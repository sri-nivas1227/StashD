"use client";
import SearchBox from "@/app/components/SearchBox";
import LinkList from "./LinkList";
import { useEffect, useMemo, useState } from "react";
import { Category, LinkType } from "@/app/types";
import {
  deleteURLAction,
  getAllLinksAction,
  getCategoriesAction,
  getLinkOnSearchAction,
  getLinksFromCategoriesAction,
  getLinksFromPublicCollection,
} from "@/app/actions";
import { toast } from "sonner";
import CategoryHeader from "./CategoryHeader";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { Plus } from "lucide-react";

interface DataPanelProps {
  showAddLinkButton?: boolean;
  showCategoryList?: boolean;
  showCategoryHeader?: boolean;
  showPublic?: boolean;
  username?: string;
  collectionSlug?: string;
}
export default function DataPanel({
  showAddLinkButton,
  showCategoryList,
  showCategoryHeader,
  showPublic,
  username,
  collectionSlug,
}: DataPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  const selectedCategoryName = useMemo(() => {
    if (showPublic) return null;
    return (
      categories.find((category) => category.id === selectedCategoryId)?.name ||
      null
    );
  }, [categories, selectedCategoryId, showPublic]);

  const categoryNameForLinks = useMemo(() => {
    if (showPublic) return null;
    return searchQuery || selectedCategoryId === "all"
      ? selectedCategoryName
      : null;
  }, [searchQuery, selectedCategoryId, selectedCategoryName, showPublic]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await getCategoriesAction();
        const nextCategories = Array.isArray(response?.data)
          ? response.data
          : [];
        setCategories(nextCategories);
      } catch (error) {
        toast.error("Failed to load categories. Please try again.");
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    if (!showPublic) {
      fetchCategories();
    }
  }, []);

  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoadingLinks(true);
      try {
        if (showPublic && username && collectionSlug) {
          const responseData = await getLinksFromPublicCollection(
            username,
            collectionSlug,
            searchQuery,
          );
          const allLinks = Array.isArray(responseData?.data?.links)
            ? responseData.data.links
            : [];
          if (!responseData.success && searchQuery) {
            toast.error(responseData.message);
          }
          setLinks(allLinks);
        } else {
          const responseData = searchQuery
            ? await getLinkOnSearchAction(searchQuery)
            : selectedCategoryId === "all"
              ? await getAllLinksAction()
              : await getLinksFromCategoriesAction(selectedCategoryId);

          const allLinks = Array.isArray(responseData?.data?.links)
            ? responseData.data.links
            : [];

          if (!responseData.success && searchQuery) {
            toast.error(responseData.message);
          }
          setLinks(allLinks);
        }
      } catch {
        toast.error("Failed to load links. Please try again.");
        setLinks([]);
      } finally {
        setIsLoadingLinks(false);
      }
    };

    fetchLinks();
  }, [selectedCategoryId, searchQuery, showPublic, username, collectionSlug]);

  const handleDeleteLink = async (link_id: string) => {
    const response = await deleteURLAction(link_id);
    if (response.success) {
      setLinks((prev) => prev.filter((item) => item._id !== link_id));
      toast.success("Link Deleted");
    } else {
      toast.warning("Deletion Failed");
    }
  };
  return (
    <div className="">
      <div className="flex items-center gap-10 mb-8">
        {/* SEARCH BOX */}
        <SearchBox setSearchQuery={setSearchQuery} />
        {/* ADD LINK BUTTON */}
        {showAddLinkButton && (
          <Link
            href="/addLink"
            className="hidden md:flex items-center justify-center rounded-2xl p-2 border bg-gray-50 font-semibold text-indigo-500 transition hover:bg-indigo-500 hover:border-indigo-500 hover:text-gray-50 hover:brightness-110"
            aria-label="Add new link"
          >
            <Plus size={22} className="font-semibold" /> Add New Link
          </Link>
        )}
      </div>

      {/* CATEGORY LIST */}
      {showCategoryList && (
        <section className="flex flex-col gap-3 my-4">
          <div className="flex md:flex-col md:items-start items-center justify-between">
            <h2 className="text-sm md:text-xl md:font-semibold font-medium text-zinc-300">
              Collections
            </h2>
            <span className="text-xs text-zinc-500">Swipe to explore</span>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {isLoadingCategories ? (
              <div className=""></div>
            ) : (
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={`whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                  selectedCategoryId === "all"
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All Links
              </button>
            )}
            {isLoadingCategories
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`category-skeleton-${index}`}
                    className="shimmer h-9 w-24 rounded-full border border-zinc-800"
                  />
                ))
              : categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                      selectedCategoryId === category.id
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
          </div>
        </section>
      )}
      <div className="flex items-center justify-between my-4">
        {showCategoryHeader && (
          <CategoryHeader
            title={selectedCategoryName}
            categoryId={selectedCategoryId}
          />
        )}
        {showAddLinkButton && (
          <Link
            href={
              selectedCategoryId != "all"
                ? `${ROUTES.ADD_LINK}?categoryId=${selectedCategoryId}`
                : ROUTES.ADD_LINK
            }
            className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
          >
            Add link
          </Link>
        )}
      </div>
      <LinkList
        links={links}
        isLoading={isLoadingLinks}
        showPublic={showPublic}
        categoryName={categoryNameForLinks}
        onDeleteLink={handleDeleteLink}
      />
    </div>
  );
}
