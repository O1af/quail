"use client";

import { format as dateFormat } from "date-fns";
import numeral from "numeral";

/**
 * Formats a number according to the provided format string
 * @param value The number to format
 * @param format The format to use (numeral.js format)
 */
export function formatNumber(value: number, format: string = "0,0.00"): string {
  return numeral(value).format(format);
}

/**
 * Formats a date according to the provided format string
 * @param date The date to format
 * @param format The format to use (date-fns format)
 */
export function formatDate(
  date: Date | string | number,
  format: string = "MMM d, yyyy"
): string {
  return dateFormat(new Date(date), format);
}
