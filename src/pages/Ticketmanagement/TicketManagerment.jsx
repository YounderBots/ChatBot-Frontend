import { Edit2, LucideBotMessageSquare, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import APICall from "../../APICalls/APICall";
import NormalLayout from "../../components/NormalLayout";
import ChatWidget from "../ChatWidget/ChatWidget";

const TicketManagementContent = () => {
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]);
    const [editingTicket, setEditingTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        ticketId: "",
        status: "",
        fromDate: "",
        toDate: "",
    });

    const PAGE_WINDOW = 3;
    const itemsPerPage = 10;


    const user = JSON.parse(localStorage.getItem("user"));

    const openEdit = (ticket) => {
        setEditingTicket({ ...ticket });
        setShowModal(true);
    };

    const saveTicket = async () => {
        try {
            await APICall.postT(
                `/conversation/update_escalation/${editingTicket.escalationId}`,
                {
                    assigned_to: editingTicket.assignedTo,
                    priority: editingTicket.priority || "MEDIUM",
                    conversation_id: editingTicket.convoId,
                    reason: editingTicket.reason,
                }
            );

            setShowModal(false);
            setEditingTicket(null);

            fetchEscalations();
        } catch (err) {
            alert("Failed to update escalation");
            console.error(err);
        }
    };


    const deleteTicket = async (escalationId) => {
        if (!window.confirm("Delete this ticket?")) return;

        try {
            await APICall.postT(
                `/conversation/delete_escalation/${escalationId}`
            );

            fetchEscalations();
        } catch (err) {
            alert("Failed to delete escalation");
            console.error(err);
        }
    };


    const filteredTickets = tickets.filter((t) => {
        const ticketId = String(t.ticketId || "");

        const matchTicket =
            ticketId.toLowerCase().includes(filters.ticketId.toLowerCase());

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

    const mapEscalationsToTickets = (data) =>
        data.map((e) => ({
            escalationId: e.id,
            ticketId: String(e.ticket_id && e.ticket_id !== 0
                ? `TKT-${e.ticket_id}`
                : `ESC-${e.id}`),

            convoId: String(e.conversation_id),
            sessionId: String(e.session_id),
            reason: e.reason || "",
            assignedToName: e.assigned_to_name || "Unassigned",
            assignedTo: e.assigned_to || "Unassigned",
            status: e.status === "PENDING" ? "Open" : e.status,
            date: new Date(e.created_at).toISOString().split("T")[0],
        }));


    const fetchEscalations = async () => {
        try {
            const res = await APICall.getT("/conversation/escalation");
            setTickets(mapEscalationsToTickets(res || []));
            console.log("res", res);
        } catch (err) {
            alert(err.message);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await APICall.getT("/hrms/users");
            console.log(res);

            setAgents(res || []);
        } catch (err) {
            console.error("Failed to fetch agents", err);
            alert("Unable to load agents");
        }
    };
    const totalPages = Math.max(
        1,
        Math.ceil(filteredTickets.length / itemsPerPage)
    );

    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(
            startIndex,
            startIndex + itemsPerPage
        );
    }, [filteredTickets, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    const getPageNumbers = () => {
        const half = Math.floor(PAGE_WINDOW / 2);

        let start = Math.max(1, currentPage - half);
        let end = start + PAGE_WINDOW - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - PAGE_WINDOW + 1);
        }

        return Array.from(
            { length: end - start + 1 },
            (_, i) => start + i
        );
    };



    useEffect(() => {
        fetchAgents()
        fetchEscalations()
    }, [])

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, tickets.length]);




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
                <Row className="g-3">
                    <Col xs={12} md={6} lg={9} >
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
                                {paginatedTickets.map((t) => (
                                    <tr key={t.escalationId}>
                                        <td><strong>{t.ticketId}</strong></td>
                                        <td>{t.convoId}</td>
                                        <td>{t.reason}</td>
                                        <td>{t.assignedToName}</td>
                                        <td>{t.status}</td>
                                        <td>{t.date}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-3">
                                                <LucideBotMessageSquare
                                                    size={16}
                                                    className="cursorPointer"
                                                    onClick={() => setActiveSessionId(t.sessionId)}
                                                />

                                                <Edit2
                                                    size={16}
                                                    className="cursorPointer"
                                                    onClick={() => openEdit(t)}
                                                />
                                                <Trash2
                                                    size={16}
                                                    className="cursorPointer text-danger"
                                                    onClick={() => deleteTicket(t.escalationId)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </Table>
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                                <small className="text-muted">
                                    Page {currentPage} of {totalPages}
                                </small>

                                <nav className="custom-pagination">
                                    <ul className="pagination pagination-sm mb-0 align-items-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link pill prev"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                Prev
                                            </button>
                                        </li>

                                        {getPageNumbers().map(page => (
                                            <li
                                                key={page}
                                                className={`page-item ${currentPage === page ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link pill"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link pill next"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </Col>
                    <Col xs={12} md={6} lg={3} className="chat-col">
                        {/* SINGLE AGENT CHAT WIDGET */}
                        {/* {activeSessionId && ( */}
                        <ChatWidget
                            agentId={user.id}
                            sessionId={activeSessionId}
                            title={`Session ${activeSessionId}`}
                            setActiveSessionId={setActiveSessionId}
                        />
                        {/* )} */}
                    </Col>
                </Row>
            </Card >

            {/* EDIT MODAL */}
            < Modal show={showModal} onHide={() => setShowModal(false)} centered >
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
                                }>
                                <option value="">Select agent</option>

                                {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.fullname}
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
            </Modal >


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
