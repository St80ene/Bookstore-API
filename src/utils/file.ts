import axios from "axios";

export function parseAndNormalizeDate(
  dateString: string,
): string | { error: string } {
  // Define the format for the date string
  const isoFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

  // Check if the date string matches the ISO 8601 format
  if (isoFormat.test(dateString)) {
    // If the format matches, convert the date string to ISO 8601 format
    return new Date(dateString).toISOString();
  }

  return {
    error: "Invalid date format. Expected format: YYYY-MM-DDTHH:mm:ss.SSSZ",
  };
}

export const googleAdditionalBookInfo = async ({ search }) => {
  try {
    const info = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${search}`,
    );

    return info?.data;
  } catch (error) {

    return error;
  }
};
