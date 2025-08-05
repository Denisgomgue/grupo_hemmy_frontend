import { useMemo, useState } from "react";
import { Device, DeviceType, DeviceStatus, DeviceUseType } from "@/types/devices/device";

export function useDeviceFilters(devices: Device[]) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ filters, setFilters ] = useState({
        status: "" as DeviceStatus | "",
        type: "" as DeviceType | "",
        useType: "" as DeviceUseType | "",
        assignedClientId: undefined as number | undefined,
        assignedEmployeeId: undefined as number | undefined
    });
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);
    const [ viewMode, setViewMode ] = useState<"list" | "grid">("list");

    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            const matchesSearch = searchTerm === "" ||
                (device.serialNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (device.brand || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (device.model || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (device.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = !filters.status || device.status === filters.status;
            const matchesType = !filters.type || device.type === filters.type;
            const matchesUseType = !filters.useType || device.useType === filters.useType;
            const matchesClientId = !filters.assignedClientId || device.assignedClientId === filters.assignedClientId;
            const matchesEmployeeId = !filters.assignedEmployeeId || device.assignedEmployeeId === filters.assignedEmployeeId;

            return matchesSearch && matchesStatus && matchesType && matchesUseType && matchesClientId && matchesEmployeeId;
        });
    }, [ devices, searchTerm, filters ]);

    const paginatedDevices = useMemo(() => {
        return filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [ filteredDevices, currentPage, pageSize ]);

    return {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        filteredDevices,
        paginatedDevices,
        totalRecords: filteredDevices.length
    };
} 