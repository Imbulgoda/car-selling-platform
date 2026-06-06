import React from 'react';

const BookingTable = ({ data }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
    {/* Desktop Table View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr style={{ backgroundColor: '#0D3778' }}>
            {['Customer', 'Vehicle Owner', 'Vehicle Name', 'Pickup date', 'Return date', 'Total Price (LKR)', 'Status (View Only)'].map((head) => (
              <th key={head} className="px-4 py-4 font-semibold text-sm border border-gray-300 text-center text-white whitespace-nowrap" style={{ backgroundColor: '#0D3778' }}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.name}</td>
              <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.vOwner}</td>
              <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.vName}</td>
              <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.pDate}</td>
              <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.rDate}</td>
              <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.price}</td>
              <td className={`px-4 py-4 font-semibold border border-gray-300 text-center ${row.sColor}`}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View */}
    <div className="md:hidden">
      {data.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No bookings found
        </div>
      ) : (
        data.map((row, i) => (
          <div key={i} className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
            <div className="space-y-3">
              {/* Customer */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-gray-600">Customer:</span>
                <span className="text-sm text-brand-dark text-right flex-1 ml-2">{row.name}</span>
              </div>
              
              {/* Vehicle Owner */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-gray-600">Vehicle Owner:</span>
                <span className="text-sm text-brand-dark text-right flex-1 ml-2">{row.vOwner}</span>
              </div>
              
              {/* Vehicle Name */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-gray-600">Vehicle Name:</span>
                <span className="text-sm text-brand-dark text-right flex-1 ml-2">{row.vName}</span>
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Pickup Date:</span>
                  <span className="text-sm text-brand-dark">{row.pDate}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Return Date:</span>
                  <span className="text-sm text-brand-dark">{row.rDate}</span>
                </div>
              </div>
              
              {/* Price */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-600">Total Price:</span>
                <span className="text-base font-bold text-brand-dark">LKR {row.price}</span>
              </div>
              
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Status:</span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${row.sColor} bg-opacity-10`}>
                  {row.status}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default BookingTable;

