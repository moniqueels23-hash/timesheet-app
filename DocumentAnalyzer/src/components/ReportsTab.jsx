import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function ReportsTab() {
  const { hasPermission } = useAuth();
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reportType, setReportType] = useState('single');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportMode, setReportMode] = useState('client'); // 'client' or 'employee'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
    loadEmployees();
  }, []);

  const loadClients = async () => {
    const data = await window.electron.clients.getAll();
    setClients(data);
  };

  const loadEmployees = async () => {
    const data = await window.electron.employees.getAll();
    setEmployees(data);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      if (reportMode === 'client') {
        if (reportType === 'single') {
          const result = await window.electron.reports.generateByClient(
            selectedClient,
            startDate,
            endDate
          );
          data = [result];
        } else {
          data = await window.electron.reports.generateAll(startDate, endDate);
        }
      } else {
        // Employee reports
        if (reportType === 'single') {
          const result = await window.electron.reports.generateByEmployee(
            selectedEmployee,
            startDate,
            endDate
          );
          data = [result];
        } else {
          data = await window.electron.reports.generateAllEmployees(startDate, endDate);
        }
      }
      setReportData(data);
    } catch (error) {
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!reportData) return;
    
    let filename;
    if (reportMode === 'client') {
      filename = reportType === 'single'
        ? `${selectedClient}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        : `all-clients-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    } else {
      const emp = employees.find(e => e.id === parseInt(selectedEmployee));
      filename = reportType === 'single'
        ? `${emp?.name || 'employee'}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        : `all-employees-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    }

    const result = await window.electron.reports.exportToExcel(reportData, filename, reportMode);
    if (result.success) {
      alert('Exported to Excel successfully!');
    } else {
      alert('Export failed: ' + result.error);
    }
  };

  const exportToPDF = async () => {
    if (!reportData) return;
    
    let filename;
    if (reportMode === 'client') {
      filename = reportType === 'single'
        ? `${selectedClient}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        : `all-clients-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    } else {
      const emp = employees.find(e => e.id === parseInt(selectedEmployee));
      filename = reportType === 'single'
        ? `${emp?.name || 'employee'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        : `all-employees-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    }

    const result = await window.electron.reports.exportToPDF(reportData, filename, reportMode);
    if (result.success) {
      alert('Exported to PDF successfully!');
    } else {
      alert('Export failed: ' + result.error);
    }
  };

  const formatDateDisplay = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd.MM.yyyy');
    } catch {
      return dateStr;
    }
  };

  const getRowClass = (entryType) => {
    if (entryType === 'Close-off') return 'timesheet-row-closeoff';
    if (entryType === 'Transfer') return 'timesheet-row-transfer';
    return 'timesheet-row-normal';
  };

  const canExport = hasPermission('export');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Reports</h2>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report By</label>
            <select
              value={reportMode}
              onChange={(e) => {
                setReportMode(e.target.value);
                setReportData(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            >
              <option value="client">By Client</option>
              <option value="employee">By Employee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            >
              <option value="single">Single {reportMode === 'client' ? 'Client' : 'Employee'}</option>
              <option value="all">All {reportMode === 'client' ? 'Clients' : 'Employees'}</option>
            </select>
          </div>

          {reportType === 'single' && reportMode === 'client' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.clientId}>{c.clientName}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'single' && reportMode === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateReport}
            disabled={loading || (reportType === 'single' && reportMode === 'client' && !selectedClient) || (reportType === 'single' && reportMode === 'employee' && !selectedEmployee)}
            className="bg-app-blue bg-app-blue-hover text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          {reportData && canExport && (
            <>
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Export to Excel
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
              >
                Export to PDF
              </button>
            </>
          )}
        </div>
      </div>

      {reportData && reportData.map((reportItem, idx) => {
        const { timesheets, openingBalance, closingBalance } = reportItem;
        const isEmployeeReport = reportMode === 'employee';
        const headerLeft = isEmployeeReport ? reportItem.employee?.name : reportItem.client?.clientName;
        const headerRight = isEmployeeReport ? reportItem.employee?.employeeId : reportItem.client?.clientId;
        
        return (
        <div key={idx} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-stretch mb-4">
            <div className="bg-app-blue text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center">
              {headerLeft}
            </div>
            <div className="bg-app-blue text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center">
              {headerRight}
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-300">
            <table className="min-w-full border-collapse text-xs" style={{tableLayout: 'auto', width: '100%'}}>
              <thead className="bg-app-blue text-white">
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold border-r border-white whitespace-nowrap">Date</th>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold border-r border-white">Description</th>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold border-r border-white whitespace-nowrap">{isEmployeeReport ? 'Client' : 'ID'}</th>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold border-r border-white whitespace-nowrap">Time</th>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold whitespace-nowrap">Charge Out</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-2 py-1.5 whitespace-nowrap border-b border-r border-gray-300"></td>
                  <td colSpan="3" className="px-2 py-1.5 border-b border-r border-gray-300">OPENING BALANCE</td>
                  <td className="px-2 py-1.5 whitespace-nowrap border-b border-gray-300">R {openingBalance?.toLocaleString() || 0}</td>
                </tr>
                {timesheets.map((ts, tsIdx) => {
                  const displayId = isEmployeeReport
                    ? ts.clientId
                    : ts.entryType === 'Close-off'
                      ? 'C/O'
                      : ts.entryType === 'Transfer' 
                        ? (ts.transferToClientId || ts.transferFromClientId || ts.linkedId)
                        : ts.linkedId;
                  
                  return (
                    <tr key={tsIdx} className={getRowClass(ts.entryType)}>
                      <td className="px-2 py-1 whitespace-nowrap border-b border-r border-gray-300">{formatDateDisplay(ts.date)}</td>
                      <td className="px-2 py-1 border-b border-r border-gray-300">{ts.description}</td>
                      <td className="px-2 py-1 whitespace-nowrap font-medium border-b border-r border-gray-300">{displayId}</td>
                      <td className="px-2 py-1 whitespace-nowrap border-b border-r border-gray-300 text-center">{ts.timeSpent}</td>
                      <td className="px-2 py-1 whitespace-nowrap border-b border-gray-300">R {ts.chargeOut}</td>
                    </tr>
                  );
                })}
                <tr className="bg-app-blue text-white font-bold">
                  <td className="px-2 py-1.5 whitespace-nowrap border-r border-white"></td>
                  <td colSpan="3" className="px-2 py-1.5 border-r border-white">CLOSING BALANCE</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    R {closingBalance?.toLocaleString() || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        );
      })}

      {reportData && reportData.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No data found for the selected criteria
        </div>
      )}
    </div>
  );
}
