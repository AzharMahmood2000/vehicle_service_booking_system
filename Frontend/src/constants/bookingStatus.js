export const BOOKING_STATUS = {
    PENDING: "REQUEST PENDING",
    APPROVED: "APPROVED",
    IN_PROGRESS: "IN PROGRESS",
    COMPLETED: "COMPLETED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED"
};

export const BOOKING_STATUS_CONFIG = {
    [BOOKING_STATUS.PENDING]: {
        label: "Request Pending",
        cssClass: "status-req-pending"
    },
    [BOOKING_STATUS.APPROVED]: {
        label: "Approved",
        cssClass: "status-approved"
    },
    [BOOKING_STATUS.IN_PROGRESS]: {
        label: "In Progress",
        cssClass: "status-progress"
    },
    [BOOKING_STATUS.COMPLETED]: {
        label: "Completed",
        cssClass: "status-completed"
    },
    [BOOKING_STATUS.REJECTED]: {
        label: "Rejected",
        cssClass: "status-rejected"
    },
    [BOOKING_STATUS.CANCELLED]: {
        label: "Cancelled",
        cssClass: "status-cancelled"
    }
};

export const normalizeBookingStatus = (status) => {
    if (!status) return BOOKING_STATUS.PENDING;
    const s = String(status).toUpperCase().trim();
    if (s === "PENDING" || s === "REQUEST PENDING" || s === "UNDER REVIEW") return BOOKING_STATUS.PENDING;
    if (s === "APPROVED") return BOOKING_STATUS.APPROVED;
    if (s === "IN PROGRESS" || s === "IN_PROGRESS") return BOOKING_STATUS.IN_PROGRESS;
    if (s === "COMPLETED") return BOOKING_STATUS.COMPLETED;
    if (s === "REJECTED") return BOOKING_STATUS.REJECTED;
    if (s === "CANCELLED") return BOOKING_STATUS.CANCELLED;
    return BOOKING_STATUS.PENDING;
};

export const isBookingBlockingCapacity = (status) => {
    const normStatus = normalizeBookingStatus(status);
    return [
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.APPROVED,
        BOOKING_STATUS.IN_PROGRESS
    ].includes(normStatus);
};
