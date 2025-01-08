import axios from "axios";
import { useEffect, useState } from "react";

type ListItem = {
  title: string;
  id: number;
};

export default function Test() {
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<Array<number[]>>([]);
  const [dataList, setDataList] = useState<ListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchIDS = async () => {
    const result = await axios.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
    );
    return result.data;
  };

  const fetchEachId = async (id: string) => {
    const result = await axios.get(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    return result.data;
  };

  const convertToPages = (data: Array<number>, size: number) => {
    const result: Array<number[]> = [];
    for (let i = 0; i < data.length; i += size) {
      result.push(data.slice(i, i + size));
    }
    return result;
  };

  const fetchPageData = async (pageIndex: number) => {
    if (!pages[pageIndex]) return;

    setIsLoading(true);
    try {
      const pagePromises = pages[pageIndex].map((id) =>
        fetchEachId(id.toString())
      );
      const pageData = await Promise.all(pagePromises);
      setDataList(pageData);
    } catch (error) {
      console.error("Error fetching page data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const ids = await fetchIDS();
        const pagesData = convertToPages(ids, 10);
        setPages(pagesData);
        await fetchPageData(0);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, [currentPage]);

  useEffect(() => {
    fetchPageData(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <ul className="space-y-2 mb-6">
            {dataList.map((item) => (
              <li
                key={item.id}
                className="p-4 border border-white/20 rounded hover:bg-white/5"
              >
                {item.title}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-center gap-2 py-4 sticky bottom-0 bg-black">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white text-black rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2 overflow-x-auto max-w-[300px] px-2">
              {Array.from({ length: pages.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-4 py-2 rounded min-w-[40px] ${
                    currentPage === i
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))
              }
              disabled={currentPage === pages.length - 1}
              className="px-4 py-2 bg-white text-black rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
