/**
 * Date and Percentage Utility Formatters
 */

export const formatPercent = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return `${Math.round(val)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getVerdictBadge = (score) => {
  if (score >= 80) {
    return {
      text: 'Exam Ready!',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      barColor: 'bg-emerald-500',
    };
  }
  if (score >= 60) {
    return {
      text: 'Sharpening Phase',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      barColor: 'bg-indigo-500',
    };
  }
  return {
    text: 'Build Foundation',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    barColor: 'bg-amber-500',
  };
};

export const truncate = (str, len = 60) => {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}...` : str;
};
