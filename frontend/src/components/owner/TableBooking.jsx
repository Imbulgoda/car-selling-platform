import React, { useEffect } from "react";
import { FileText, Calendar, Car, User, CreditCard } from "lucide-react";

const BookingTable = ({ data = [], loading = false, onViewAction }) => {
  useEffect(() => {
    const vehicleIds = data.map(booking => ({
      id: booking.vehicleId?._id,
      title: booking.vehicleId?.title,
      numberPlate: booking.vehicleId?.numberPlate
    }));
    console.log('Vehicle IDs:', vehicleIds);
  }, [data]);
  const tableHeaders = [
    "Customer", "Vehicle No", "Vehicle Name", "Pickup date", 
    "Return date", "Total Price (LKR)", "Status", "Action",
  ];

  const dummyData = [
    {
      _id: "1",
      customerId: { first_name: "Jason", last_name: "Lee", email: "jasonlee@example.com" },
      vehicleId: { title: "Toyota Corolla", numberPlate: "CA-1234" },
      startingDate: "2026-01-23",
      endDate: "2026-01-25",
      totalAmount: 24000,
      status: "pending",
    },
    {
      _id: "2",
      customerId: { first_name: "Kevin", last_name: "Martinez", email: "kevin@example.com" },
      vehicleId: { title: "Honda Civic", numberPlate: "WP-4678" },
      startingDate: "2026-02-01",
      endDate: "2026-02-03",
      totalAmount: 19000,
      status: "approved",
    }
  ];

  const displayData = data.length > 0 ? data : dummyData;

  const getStatusStyles = (status) => {
    const map = {
      pending: "bg-orange-100 text-[#BF5E14] border-orange-200",
      approved: "bg-green-100 text-[#008236] border-green-200",
      rejected: "bg-red-100 text-[#E53E3E] border-red-200",
    };
    return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return <div className="p-10 text-center font-['Nunito'] text-gray-500">Loading bookings...</div>;
  }

  return (
    <div className="font-['Nunito']">
      {/* --- Mobile Card View (Visible on small screens) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {displayData.map((row) => (
          <div key={row._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
            {/* Status Badge */}
            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold uppercase border-l border-b ${getStatusStyles(row.status)}`}>
              {row.status}
            </div>

            {/* Customer & Vehicle Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#0D3778]/10 p-2 rounded-lg">
                <User size={20} className="text-[#0D3778]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">
                  {row.customerId ? `${row.customerId.first_name} ${row.customerId.last_name}` : "N/A"}
                </h3>
                <p className="text-xs text-gray-500">{row.customerId?.email}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600 italic">
                <Car size={16} className="mr-2" />
                <span className="font-semibold text-gray-800">{row.vehicleId?.title}</span>
                <span className="mx-2">•</span>
                <span>{row.vehicleId?.numberPlate}</span>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Pickup</p>
                  <p className="text-sm font-medium">{new Date(row.startingDate).toLocaleDateString()}</p>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold">Return</p>
                  <p className="text-sm font-medium">{new Date(row.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">Total Amount</p>
                <p className="text-[#0D3778] font-extrabold text-lg">LKR {row.totalAmount?.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => onViewAction(row)}
                className="flex items-center gap-2 bg-[#0D3778] text-white px-4 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
              >
                <FileText size={16} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Desktop Table View (Hidden on small screens) --- */}
      <div className="hidden md:block bg-white rounded-sm overflow-hidden border border-[#ffffff] shadow-md">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-[#0D3778] text-white">
              {tableHeaders.map((head) => (
                <th key={head} className="px-4 py-6 border border-[#ffffff] font-semibold text-sm tracking-wide">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {displayData.map((row) => (
              <tr key={row._id} className="border-b border-[#ebe6e5] hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778] font-medium">
                  {row.customerId ? `${row.customerId.first_name} ${row.customerId.last_name}` : "N/A"}
                </td>
                <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{row.vehicleId?.numberPlate}</td>
                <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{row.vehicleId?.title}</td>
                <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{new Date(row.startingDate).toLocaleDateString()}</td>
                <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{new Date(row.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778] font-semibold">{row.totalAmount?.toLocaleString()}</td>
                <td className="px-4 py-4 border border-[#0D3778]">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyles(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-4 border border-[#0D3778]">
                  <button 
                    onClick={() => onViewAction(row)}
                    className="text-[#0D3778] hover:scale-125 transition-transform p-1"
                  >
                    <FileText size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;