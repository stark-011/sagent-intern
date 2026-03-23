import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import * as stockService from "../../api/stockService";
import ConfirmDialog from "../../components/ConfirmDialog";
import Loader from "../../components/Loader";
import {
  getAvailabilityLabel,
  getBookAuthor,
  getBookSubject,
  getBookTitle,
  getEntityId,
  safeText,
} from "../../utils/fieldUtils";

const initialForm = {
  title: "",
  author: "",
  subject: "",
  status: "Book Available",
  availableCopies: "",
  totalCopies: "",
};

const availabilityClass = (label) => {
  if (label === "Book Available") return "bg-emerald-100 text-emerald-800";
  if (label === "Damaged") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
};

const ManageBooks = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [books, setBooks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

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
    const query = safeText(searchText).toLowerCase();
    if (!query) return books;
    return books.filter((book) => {
      const title = getBookTitle(book).toLowerCase();
      const author = getBookAuthor(book).toLowerCase();
      const subject = getBookSubject(book).toLowerCase();
      return title.includes(query) || author.includes(query) || subject.includes(query);
    });
  }, [books, searchText]);

  const openAddModal = () => {
    setEditingBook(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: getBookTitle(book),
      author: getBookAuthor(book),
      subject: getBookSubject(book),
      status: safeText(book.status || book.condition || "Book Available"),
      availableCopies: safeText(
        book.availableCopies ?? book.availableQuantity ?? book.quantityAvailable
      ),
      totalCopies: safeText(book.totalCopies ?? book.quantity ?? book.copies),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingBook(null);
    setForm(initialForm);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = (source) => {
    const payload = {};
    Object.entries(source).forEach(([key, value]) => {
      if (safeText(value) !== "") payload[key] = value;
    });

    if (payload.availableCopies !== undefined) {
      payload.availableCopies = Number(payload.availableCopies);
    }
    if (payload.totalCopies !== undefined) {
      payload.totalCopies = Number(payload.totalCopies);
    }

    return payload;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload(form);

      if (editingBook) {
        const id = getEntityId(editingBook);
        const updated = await stockService.patchStock(id, payload);
        setBooks((prev) => prev.map((book) => (getEntityId(book) === id ? updated : book)));
        toast.success("Book updated");
      } else {
        const created = await stockService.createStock(payload);
        setBooks((prev) => [created, ...prev]);
        toast.success("Book added");
      }

      closeModal();
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const patchStatus = async (id, status) => {
    try {
      const updated = await stockService.patchStock(id, { status });
      setBooks((prev) => prev.map((book) => (getEntityId(book) === id ? updated : book)));
      toast.success(`Book marked as ${status}`);
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Status update failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    setDeleting(true);
    try {
      await stockService.deleteStock(deleteDialog.id);
      setBooks((prev) => prev.filter((book) => getEntityId(book) !== deleteDialog.id));
      toast.success("Book deleted");
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader text="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="label" htmlFor="bookSearch">
              Search Books
            </label>
            <input
              id="bookSearch"
              className="input"
              placeholder="Search by title, author or subject"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={openAddModal}>
            Add New Book
          </button>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <h2 className="text-xl font-semibold text-slate-900">Inventory Management</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Availability</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-center text-slate-500">
                    No books found.
                  </td>
                </tr>
              )}

              {filteredBooks.map((book) => {
                const id = getEntityId(book);
                const availability = getAvailabilityLabel(book);
                return (
                  <tr key={id || `${getBookTitle(book)}-${getBookAuthor(book)}`} className="border-t">
                    <td className="px-3 py-2">{id || "-"}</td>
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
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" className="btn-secondary" onClick={() => openEditModal(book)}>
                          Edit
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => patchStatus(id, "Damaged")}>
                          Mark Damaged
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => patchStatus(id, "Lost")}>
                          Mark Lost
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => setDeleteDialog({ open: true, id })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-slate-900">
              {editingBook ? "Update Book" : "Add New Book"}
            </h3>
            <form onSubmit={handleSave} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Title</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="label">Author</label>
                <input
                  className="input"
                  name="author"
                  value={form.author}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="label">Subject</label>
                <input
                  className="input"
                  name="subject"
                  value={form.subject}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option>Book Available</option>
                  <option>Book Not Available</option>
                  <option>Damaged</option>
                  <option>Lost</option>
                </select>
              </div>

              <div>
                <label className="label">Available Copies</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  name="availableCopies"
                  value={form.availableCopies}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <label className="label">Total Copies</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  name="totalCopies"
                  value={form.totalCopies}
                  onChange={handleFormChange}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingBook ? "Update Book" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Book"
        message="This action will permanently remove the selected book from stock."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />
    </div>
  );
};

export default ManageBooks;
