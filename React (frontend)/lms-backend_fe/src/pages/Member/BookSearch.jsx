import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import * as issueService from "../../api/issueService";
import * as stockService from "../../api/stockService";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  getAvailabilityLabel,
  getBookAuthor,
  getBookSubject,
  getBookTitle,
  getEntityId,
  getUserId,
  safeText,
} from "../../utils/fieldUtils";

const availabilityClass = (label) => {
  if (label === "Book Available") return "bg-emerald-100 text-emerald-800";
  if (label === "Damaged") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
};

const BookSearch = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requestingBookId, setRequestingBookId] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchField, setSearchField] = useState("title");
  const [searchText, setSearchText] = useState("");

  const userId = getUserId(user || {});

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await stockService.getAllStock();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const needle = safeText(searchText).toLowerCase();
    if (!needle) return books;

    return books.filter((book) => {
      const title = getBookTitle(book).toLowerCase();
      const author = getBookAuthor(book).toLowerCase();
      const subject = getBookSubject(book).toLowerCase();

      if (searchField === "author") return author.includes(needle);
      if (searchField === "subject") return subject.includes(needle);
      return title.includes(needle);
    });
  }, [books, searchField, searchText]);

  const requestBook = async (book) => {
    if (!userId) {
      toast.error("Unable to determine current user");
      return;
    }

    const stockId = getEntityId(book);
    if (!stockId) {
      toast.error("Book ID is missing");
      return;
    }

    const availability = getAvailabilityLabel(book);
    if (availability !== "Book Available") {
      toast.error("Only available books can be requested");
      return;
    }

    setRequestingBookId(stockId);
    try {
      await issueService.createIssue({
        userId,
        stockId,
        bookId: stockId,
        status: "Requested",
      });
      toast.success("Book request submitted");
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Failed to submit request");
    } finally {
      setRequestingBookId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading catalog..." />;
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="w-full md:w-40">
            <label className="label" htmlFor="searchField">
              Search By
            </label>
            <select
              id="searchField"
              className="input"
              value={searchField}
              onChange={(event) => setSearchField(event.target.value)}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="subject">Subject</option>
            </select>
          </div>

          <div className="w-full">
            <label className="label" htmlFor="searchText">
              Search
            </label>
            <input
              id="searchText"
              className="input"
              placeholder={`Search books by ${searchField}`}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <h2 className="text-xl font-semibold text-slate-900">Book Catalog</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Availability</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-5 text-center text-slate-500">
                    No books found.
                  </td>
                </tr>
              )}

              {filteredBooks.map((book) => {
                const id = getEntityId(book);
                const availability = getAvailabilityLabel(book);
                const isRequesting = requestingBookId != null && requestingBookId === id;
                return (
                  <tr key={id || `${getBookTitle(book)}-${getBookAuthor(book)}`} className="border-t">
                    <td className="px-3 py-2 font-medium text-slate-900">{getBookTitle(book)}</td>
                    <td className="px-3 py-2">{getBookAuthor(book)}</td>
                    <td className="px-3 py-2">{getBookSubject(book)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${availabilityClass(
                          availability
                        )}`}
                      >
                        {availability}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => requestBook(book)}
                        disabled={availability !== "Book Available" || isRequesting}
                      >
                        {isRequesting ? "Requesting..." : "Request Book"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BookSearch;
