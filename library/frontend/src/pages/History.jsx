import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

export default function History() {
  const [history, setHistory] = useState([]);
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'checkoutDate', direction: 'desc' });
  const [filter, setFilter] = useState('');

  // Column configuration with labels and keys
  const columns = [
    { label: 'Student Name', key: 'studentName' },
    { label: 'Student ID', key: 'studentId' },
    { label: 'Book Title', key: 'bookTitle' },
    { label: 'Book ID', key: 'bookId' },
    { label: 'Check-out Date', key: 'checkoutDate' },
    { label: 'Check-in Date', key: 'checkinDate' },
    { label: 'Status', key: 'status' },
  ];

  useEffect(() => {
    // Align with other pages using 'digilib_institution'
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    setHistory(institutionData.history || []);
    setActiveTransactions(institutionData.transactions || []);
  }, []);

  const handleSort = (key) => {
    const isSameKey = sortConfig.key === key;
    const nextDir = isSameKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction: nextDir });
  };

  // Map active transactions into history-like rows
  const activeMapped = (activeTransactions || []).map((t) => ({
    studentName: t.studentName,
    studentId: t.studentId,
    bookTitle: t.bookTitle,
    bookId: t.bookId,
    checkoutDate: t.checkoutDate,
    checkinDate: '',
    status: t.status || 'checkedOut',
  }));

  const combined = [...history, ...activeMapped];

  const sortedHistory = [...combined].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    if (av < bv) return direction === 'asc' ? -1 : 1;
    if (av > bv) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredHistory = sortedHistory.filter((item) =>
    Object.values(item || {}).some((value) =>
      String(value ?? '').toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Simple CSV generator (no external dependency)
  const toCSV = (rows, fields) => {
    const escape = (val) => {
      const s = String(val ?? '');
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const header = fields.map(escape).join(',');
    const body = rows
      .map((r) => fields.map((f) => escape(r[f])).join(','))
      .join('\n');
    return header + '\n' + body;
  };

  const exportToCSV = () => {
    try {
      const fields = columns.map((c) => c.key);
      const csv = toCSV(filteredHistory, fields);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'transaction_history.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const clearHistory = () => {
    if (!window.confirm('This will permanently clear returned transaction logs. Active transactions will remain. Continue?')) return;
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    const updated = { ...institutionData, history: [] };
    localStorage.setItem('digilib_institution', JSON.stringify(updated));
    setHistory([]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(25, 118, 210, 0.12)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" color="primary" fontWeight={700} sx={{ letterSpacing: '0.02em' }}>
            Transaction History
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Filter records..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={exportToCSV} startIcon={<DownloadIcon />} sx={{ fontWeight: 700 }}>
              Export CSV
            </Button>
            <Button variant="outlined" color="error" onClick={clearHistory} sx={{ fontWeight: 700 }}>
              Clear History
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">In Hand</Typography>
            <Typography variant="h6" fontWeight={700}>{activeTransactions.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">Returned</Typography>
            <Typography variant="h6" fontWeight={700}>{history.filter(h => h.status === 'returned').length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">Total Logs</Typography>
            <Typography variant="h6" fontWeight={700}>{combined.length}</Typography>
          </Paper>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ fontWeight: 700, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{col.label}</span>
                      <Tooltip title="Sort">
                        <IconButton size="small" onClick={() => handleSort(col.key)}>
                          {sortConfig.key === col.key ? (
                            sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />
                          ) : (
                            <ArrowDownwardIcon fontSize="inherit" sx={{ opacity: 0.3 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.studentName}</TableCell>
                  <TableCell>{item.studentId}</TableCell>
                  <TableCell>{item.bookTitle}</TableCell>
                  <TableCell>{item.bookId}</TableCell>
                  <TableCell>{item.checkoutDate}</TableCell>
                  <TableCell>{item.checkinDate}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredHistory.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
            No transaction history found
          </Typography>
        )}
      </Paper>
    </Container>
  );
}