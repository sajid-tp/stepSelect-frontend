import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../../features/admin/authSlice';
import AdminSidebar from '../../components/AdminSideBar';
function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.auth?.admin);

  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Total Revenue',
      value: '$48,320.00',
      change: '+14.6%',
      isPositive: true,
      subtext: 'vs last 30 days',
      icon: (
        <svg className="h-5 w-5 text-[#f95721]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Total Orders',
      value: '1,429',
      change: '+8.2%',
      isPositive: true,
      subtext: 'vs last 30 days',
      icon: (
        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      title: 'Active Products',
      value: '78 pairs',
      change: '+4 new',
      isPositive: true,
      subtext: 'in stock catalog',
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      title: 'Customers',
      value: '3,840',
      change: '+19.3%',
      isPositive: true,
      subtext: 'registered shoppers',
      icon: (
        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const recentOrders = [
    {
      id: 'ORD-9824',
      customer: 'Alex Rivera',
      email: 'alex.r@example.com',
      item: 'Air Glide Retro 95 (Size 10)',
      amount: '$189.00',
      date: 'Sep 14, 2026',
      status: 'Delivered',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'ORD-9823',
      customer: 'Sophia Chen',
      email: 'sophia.c@example.com',
      item: 'Velocity Runner Volt (Size 8)',
      amount: '$145.00',
      date: 'Sep 14, 2026',
      status: 'In Transit',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'ORD-9822',
      customer: 'Marcus Vance',
      email: 'marcus.v@example.com',
      item: 'Urban Pulse Classic High (Size 11)',
      amount: '$210.00',
      date: 'Sep 13, 2026',
      status: 'Processing',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'ORD-9821',
      customer: 'Elena Rostova',
      email: 'elena.r@example.com',
      item: 'Cloud Step Minimalist (Size 7)',
      amount: '$120.00',
      date: 'Sep 13, 2026',
      status: 'Delivered',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'ORD-9820',
      customer: 'David Kim',
      email: 'david.k@example.com',
      item: 'Apex Horizon Trainer (Size 9.5)',
      amount: '$165.00',
      date: 'Sep 12, 2026',
      status: 'Shipped',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  ];

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin');
  };

  const filteredOrders = recentOrders.filter(
    (order) =>
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item.toLowerCase().includes(searchQuery.toLowerCase())
  );

return (
  <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased">

    {/* Fixed Sidebar */}
    <AdminSidebar />

    {/* Right-side content */}
    <div className="ml-[214px] min-h-screen min-w-0">

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 h-16 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-lg font-black tracking-tight text-gray-900"
            >
              STEP SELECT
            </Link>

            <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#f95721]">
              Admin
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Store status */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Store Online
            </div>

            {/* Storefront */}
            <Link
              to="/"
              className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              View Storefront ↗
            </Link>

            <div className="h-4 w-px bg-gray-200" />

            {/* Admin */}
            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {admin?.name ? admin.name[0].toUpperCase() : "A"}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold leading-tight text-gray-900">
                  {admin?.name || "Store Admin"}
                </p>

                <p className="text-[11px] text-gray-400">
                  {admin?.email || "admin@stepselect.com"}
                </p>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-w-0 px-6 py-8 lg:px-8">

        {/* Title Bar */}
        <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Store Overview
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage footwear inventory, track customer orders, and analyze
              store performance.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              className="flex items-center gap-1.5 rounded-lg bg-[#f95721] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#e04818]"
            >
              <span>+</span>
              Add Product
            </button>

            <button
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Export
            </button>

          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            >

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {stat.title}
                </span>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                  {stat.icon}
                </div>

              </div>

              <div className="mt-3">

                <p className="text-2xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-xs">

                  <span className="font-semibold text-emerald-600">
                    {stat.change}
                  </span>

                  <span className="text-gray-400">
                    {stat.subtext}
                  </span>

                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Orders Section */}
        <div className="mt-8 min-w-0 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">

          {/* Tabs + Search */}
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200/80 px-6 py-4 sm:flex-row sm:items-center">

            <div className="flex gap-2">

              {[
                { id: "orders", label: "Recent Orders" },
                { id: "inventory", label: "Inventory (Sneakers)" },
                { id: "customers", label: "Customers" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">

              <input
                type="text"
                placeholder="Search orders or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/70 py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 focus:bg-white"
              />

              <svg
                className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  strokeWidth="2"
                />

                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                  strokeWidth="2"
                />
              </svg>

            </div>
          </div>

          {/* Orders Table */}
          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-xs">

              <thead className="border-b border-gray-100 bg-gray-50/60 font-semibold uppercase tracking-wider text-gray-400">

                <tr>

                  <th className="px-6 py-3">
                    Order ID
                  </th>

                  <th className="px-6 py-3">
                    Customer
                  </th>

                  <th className="px-6 py-3">
                    Product
                  </th>

                  <th className="px-6 py-3">
                    Date
                  </th>

                  <th className="px-6 py-3">
                    Status
                  </th>

                  <th className="px-6 py-3">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100 text-gray-700">

                {filteredOrders.length > 0 ? (

                  filteredOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50/80"
                    >

                      <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-900">
                        {order.id}
                      </td>

                      <td className="px-6 py-3.5">

                        <div className="font-medium text-gray-900">
                          {order.customer}
                        </div>

                        <div className="text-[11px] text-gray-400">
                          {order.email}
                        </div>

                      </td>

                      <td className="px-6 py-3.5 font-medium text-gray-800">
                        {order.item}
                      </td>

                      <td className="whitespace-nowrap px-6 py-3.5 text-gray-500">
                        {order.date}
                      </td>

                      <td className="whitespace-nowrap px-6 py-3.5">

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${order.badgeClass}`}
                        >
                          {order.status}
                        </span>

                      </td>

                      <td className="whitespace-nowrap px-6 py-3.5 font-bold text-gray-900">
                        {order.amount}
                      </td>

                      <td className="whitespace-nowrap px-6 py-3.5 text-right">

                        <button className="text-xs font-semibold text-[#f95721] hover:underline">
                          View Details
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No matching orders found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-xs text-gray-500">

            <span>
              Showing {filteredOrders.length} of {recentOrders.length} orders
            </span>

            <div className="flex gap-1">

              <button
                className="rounded border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Prev
              </button>

              <button className="rounded border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50">
                Next
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  </div>
);
}

export default AdminDashboard;
