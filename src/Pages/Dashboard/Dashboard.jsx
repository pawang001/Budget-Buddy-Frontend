import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../API/API";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";

const COLORS = ["#10b981", "#ef4444"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/analytics/stats"),
        ]);
        setUser(userRes.data);
        setAnalytics(statsRes.data);
      } catch (e) {
        console.error("Fetch failed", e);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const pieData = [
    { name: "Income", value: analytics.totalIncome || 0 },
    { name: "Expense", value: analytics.totalExpense || 0 },
  ];

  const monthlyData = analytics.monthly || [];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
          {loading ? (
            <Skeleton width={200} />
          ) : (
            `Welcome, ${user.username || user.name}!`
          )}
        </h1>
      </header>

      {loading ? (
        <>
          <Skeleton height={32} width={160} />
          <Skeleton height={250} />
          <Skeleton height={200} style={{ marginTop: "30px" }} />
        </>
      ) : (
        <section className="analytics modern-analytics">
          <h3>Summary</h3>
          <div className="chart-grid">
            <div className="stat-summary">
              <div className="modern-stat income">
                Income: ₹{analytics.totalIncome}
              </div>
              <div className="modern-stat expense">
                Expense: ₹{analytics.totalExpense}
              </div>
              <div className="modern-stat balance">
                Balance: ₹{analytics.balance}
              </div>
            </div>

            <div className="modern-chart">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="modern-line">
              <h4>Monthly Trends</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
