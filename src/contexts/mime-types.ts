import {
  FaFileExcel,
  FaFilePdf,
  FaFileArchive,
  FaFileImage,
} from "react-icons/fa";

export const MIME_TYPES = [
  {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    icon: FaFileExcel,
    color: "#28a745",
  },
  {
    mime: "application/vnd.ms-excel",
    icon: FaFileExcel,
    color: "#28a745",
  },
  {
    mime: "application/pdf",
    icon: FaFilePdf,
    color: "#dc3545",
  },
  {
    mime: "application/zip",
    icon: FaFileArchive,
    color: "#ffc107",
  },
  {
    mime: "application/x-zip-compressed",
    icon: FaFileArchive,
    color: "#ffc107",
  },
  {
    mime: "application/x-rar-compressed",
    icon: FaFileArchive,
    color: "#ffc107",
  },
  {
    mime: "application/vnd.rar",
    icon: FaFileArchive,
    color: "#ffc107",
  },
  {
    mime: "image/jpeg",
    icon: FaFileImage,
    color: "#ffc107",
  },
  {
    mime: "image/png",
    icon: FaFileImage,
    color: "#ffc107",
  }
];
