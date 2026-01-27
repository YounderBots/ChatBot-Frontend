import React, { useState } from "react";
import { Card, Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { Edit2, Trash2 } from "lucide-react";
import NormalLayout from "../../components/NormalLayout";

const INITIAL_TICKETS = [
    {
        ticketId: "TCK-1001",
        convoId: "CONV-9001",
        reason: "User requested human agent",
        assignedTo: "John Doe",
        status: "Open",
        date: "2024-01-10",
    },
    {
        ticketId: "TCK-1002",
        convoId: "CONV-9005",
        reason: "Payment issue",
        assignedTo: "Sarah Smith",
        status: "In Progress",
        date: "2024-01-11",
    },
    {
        ticketId: "TCK-1003",
        convoId: "CONV-9010",
        reason: "Bot not responding",
        assignedTo: "Alex Brown",
        status: "Closed",
        date: "2024-01-12",
    },
];

const AGENTS = [
    "John Doe",
    "Sarah Smith",
    "Alex Brown",
    "Emily Johnson",
    "Michael Lee",
];

const TicketManagementContent = () => {
    const [tickets, setTickets] = useState(INITIAL_TICKETS);
    const [editingTicket, setEditingTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        ticketId: "",
        status: "",
        fromDate: "",
        toDate: "",
    });

    const openEdit = (ticket) => {
        setEditingTicket({ ...ticket });
        setShowModal(true);
    };

    const saveTicket = () => {
        setTickets((prev) =>
            prev.map((t) =>
                t.ticketId === editingTicket.ticketId ? editingTicket : t
            )
        );
        setShowModal(false);
    };

    const deleteTicket = (id) => {
        if (!window.confirm("Delete this ticket?")) return;
        setTickets((prev) => prev.filter((t) => t.ticketId !== id));
    };

    const filteredTickets = tickets.filter((t) => {
        const matchTicket =
            t.ticketId.toLowerCase().includes(filters.ticketId.toLowerCase());

        const matchStatus =
            !filters.status || t.status === filters.status;

        const ticketDate = new Date(t.date);
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        const matchDate =
            (!fromDate || ticketDate >= fromDate) &&
            (!toDate || ticketDate <= toDate);

        return matchTicket && matchStatus && matchDate;
    });


    return (
        <>
            <Card className="shadow-sm border-0 mb-3">
                <Card.Body>
                    <Row className="g-2 align-items-end">
                        <Col lg={3} md={6}>
                            <Form.Control
                                placeholder="Search Ticket ID"
                                value={filters.ticketId}
                                onChange={(e) =>
                                    setFilters({ ...filters, ticketId: e.target.value })
                                }
                            />
                        </Col>

                        <Col lg={3} md={6}>
                            <Form.Select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({ ...filters, status: e.target.value })
                                }
                            >
                                <option value="">All</option>
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Closed</option>
                            </Form.Select>
                        </Col>

                        <Col lg={3} md={6}>
                            <Form.Control
                                type="date"
                                value={filters.fromDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, fromDate: e.target.value })
                                }
                            />
                        </Col>

                        <Col lg={3} md={6}>
                            <Form.Control
                                type="date"
                                value={filters.toDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, toDate: e.target.value })
                                }
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 mt-2">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Ticket ID</th>
                            <th>Conversation ID</th>
                            <th>Reason</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTickets.map((t) => (
                            <tr key={t.ticketId}>
                                <td><strong>{t.ticketId}</strong></td>
                                <td>{t.convoId}</td>
                                <td>{t.reason}</td>
                                <td>{t.assignedTo}</td>
                                <td>{t.status}</td>
                                <td>{t.date}</td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center gap-3">
                                        <Edit2
                                            size={16}
                                            className="cursorPointer"
                                            onClick={() => openEdit(t)}
                                        />
                                        <Trash2
                                            size={16}
                                            className="cursorPointer text-danger"
                                            onClick={() => deleteTicket(t.ticketId)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </Table>
            </Card>

            {/* EDIT MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Ticket</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Assigned To</Form.Label>
                            <Form.Select
                                value={editingTicket?.assignedTo || ""}
                                onChange={(e) =>
                                    setEditingTicket({
                                        ...editingTicket,
                                        assignedTo: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select agent</option>
                                {AGENTS.map((agent) => (
                                    <option key={agent} value={agent}>
                                        {agent}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={editingTicket?.status || ""}
                                onChange={(e) =>
                                    setEditingTicket({
                                        ...editingTicket,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Closed</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Reason</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={editingTicket?.reason || ""}
                                onChange={(e) =>
                                    setEditingTicket({
                                        ...editingTicket,
                                        reason: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button className="primaryBtn" onClick={saveTicket}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const TicketManagement = () => {
    return (
        <NormalLayout>
            <TicketManagementContent />
        </NormalLayout>
    );
};

export default TicketManagement;
