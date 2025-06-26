import React, { useState, useEffect, useCallback } from "react";
import { FaSortUp, FaSortDown, FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import api from "../../API/API";
import "./Transactions.css";

const ITEMS_PER_PAGE = 5;

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const TransactionModal = ({ onClose, onSave, transaction }) => {
  const [form, setForm] = useState({
    title: transaction?.title || "",
    amount: transaction?.amount || "",
    type: transaction?.type || "income",
    category: transaction?.category || "",
    date: transaction?.date ? transaction.date.slice(0, 10) : "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{transaction ? "Edit" : "Add"} Transaction</h3>
        <form onSubmit={handleSubmit}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions/getAll");
      setTransactions(res.data);
      setFilteredTx(res.data);
    } catch (err) {
      console.error("Fetch transactions failed", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = useCallback(
    debounce((value) => {
      const query = value.toLowerCase();
      const filtered = transactions.filter(tx =>
        tx.title.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query)
      );
      setFilteredTx(filtered);
      setCurrentPage(1);
    }, 400),
    [transactions]
  );

  const handleSort = (key) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
    const sorted = [...filteredTx].sort((a, b) => {
      if (key === "amount") return newOrder === "asc" ? a[key] - b[key] : b[key] - a[key];
      return newOrder === "asc" ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
    });
    setFilteredTx(sorted);
  };

  const handleSave = async (formData) => {
    try {
      if (isEditing && selectedTx) {
        await api.put(`/transactions/update/${selectedTx.id}`, formData);
      } else {
        await api.post("/transactions/add", formData);
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/delete/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Pagination logic
  const paginatedTx = filteredTx.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredTx.length / ITEMS_PER_PAGE);

  const renderSortIcon = (key) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? <FaSortUp className="icon" /> : <FaSortDown className="icon" />;
  };

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2>Transactions</h2>
        <button onClick={() => {
          setIsEditing(false);
          setSelectedTx(null);
          setShowModal(true);
        }}>
          <FaPlus className="icon" /> Add
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or category..."
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          value={search}
        />
      </div>

      <div className="transactions">
        {paginatedTx.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("title")}>Title {renderSortIcon("title")}</th>
                <th onClick={() => handleSort("amount")}>Amount {renderSortIcon("amount")}</th>
                <th onClick={() => handleSort("type")}>Type {renderSortIcon("type")}</th>
                <th onClick={() => handleSort("category")}>Category {renderSortIcon("category")}</th>
                <th onClick={() => handleSort("date")}>Date {renderSortIcon("date")}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTx.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.title}</td>
                  <td>₹{tx.amount}</td>
                  <td className={tx.type}>{tx.type}</td>
                  <td>{tx.category}</td>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => {
                      setIsEditing(true);
                      setSelectedTx(tx);
                      setShowModal(true);
                    }}>
                      <FaEdit className="icon" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)}>
                      <FaTrash className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={currentPage === idx + 1 ? "active" : ""}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          transaction={isEditing ? selectedTx : null}
        />
      )}
    </div>
  );
};

export default Transactions;
