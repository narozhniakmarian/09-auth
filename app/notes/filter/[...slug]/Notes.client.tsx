//app>notes>Notes.client.tsx

"use client";

import noteFetch from "@/lib/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import css from "./NotesPage.module.css";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import Loader from "@/app/loading";
import ErrorMessage from "@/app/notes/filter/[...slug]/error";
import NoteList from "@/components/NoteList/NoteList";
import Link from "next/link";

export default function NotesClient({ tag }: { tag?: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [debouncedSearch] = useDebounce(search, 300);

  const handleChange = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  });

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["noteHubKey", debouncedSearch, page, tag],
    queryFn: () => noteFetch(debouncedSearch, page, undefined, tag),
    placeholderData: keepPreviousData,
  });
  const notes = data?.notes ?? [];
  useEffect(() => {
    if (localStorage.getItem("noteCreated") === "true") {
      toast.success("Your note added successfully");
      // setTimeout(() => {
      //   localStorage.removeItem("noteCreated");
      // }, 1000);
      requestAnimationFrame(() => {
        localStorage.removeItem("noteCreated");
      });
    }
  }, []);

  useEffect(() => {
    if (
      isSuccess &&
      (data?.notes?.length ?? 0) === 0 &&
      debouncedSearch.trim()
    ) {
      toast.error("No notes found for your request.");
    }
  }, [data?.notes, isSuccess, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  return (
    <section className={css.app}>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className={css.toolbar}>
        <SearchBox value={search} onChange={(value) => handleChange(value)} />
        {isSuccess && notes.length > 0 && data?.totalPages > 1 && (
          <Pagination
            totalPages={data.totalPages ?? 0}
            page={page}
            setPage={(newPage) => setPage(newPage)}
          />
        )}

        <Link className={css.button} href={"/notes/action/create"}>
          Create note
        </Link>

        {isOpenModal && (
          <Modal onClose={() => setIsOpenModal(false)}>
            <NoteForm />
          </Modal>
        )}
      </div>

      {isLoading && <Loader />}

      {isError && <ErrorMessage />}

      {isSuccess && notes.length > 0 && <NoteList notes={notes} />}
    </section>
  );
}
