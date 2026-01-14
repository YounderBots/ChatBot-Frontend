import React, { useState } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { Search, X } from "lucide-react";
import TabComponent from "../../components/TabComponent";

const ConversationManager = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIntents, setSelectedIntents] = useState([]);
  const intents = ["Greeting", "Order", "Payment", "Complaint"];

  const [confidence, setConfidence] = useState([0, 100]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sentiment, setSentiment] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedConversation, setSelectedConversation] = useState(null);




  const totalPages = 5


  const toggleIntent = (intent) => {
    setSelectedIntents((prev) =>
      prev.includes(intent)
        ? prev.filter((i) => i !== intent)
        : [...prev, intent]
    );
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedIntents([]);
    setConfidence([0, 100]);
    setStatusFilter([]);
    setSentiment("All");
    setSearch("");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };



  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };


  const conversations = [
    {
      id: "sess1",
      user: "Alice Johnson",
      avatar: "K",
      firstMessage: "Hi, I need help with my order",
      lastTimestamp: "2026-01-14 10:35",
      intent: "Order Status",
      confidence: 82,
      unread: true,
      status: "Pending",
      messages: [
        { type: "user", text: "Hi, I need help with my order", timestamp: "10:01", intent: "Order Status", confidence: 82, entities: ["OrderID"] },
        { type: "bot", text: "Sure! Can you provide your order ID?", timestamp: "10:02" },
        { type: "user", text: "Order12345", timestamp: "10:03", intent: "Order Status", confidence: 95, entities: [] },
        { type: "agent", text: "Checking your order details...", timestamp: "10:05" },
      ]
    },
    {
      id: "sess2",
      user: "Bob Smith",
      avatar: "V",
      firstMessage: "Payment not reflecting",
      lastTimestamp: "2026-01-13 18:20",
      intent: "Payment Issue",
      confidence: 90,
      unread: false,
      status: "Resolved",
      messages: [
        { type: "user", text: "Payment not reflecting", timestamp: "09:45", intent: "Payment Issue", confidence: 90, entities: [] },
        { type: "bot", text: "Please provide transaction ID", timestamp: "09:46" },
      ]
    },
  ];


  const pageContent = {
    title: "Conversation Manager",
    subTitle: "Monitor and manage user-bot interactions",
    tabs: [
      {
        tabTitle: "Conversations",
        tabKey: "Conversations",
        tabContent: <>

          <Row className="g-1">
            <Form.Label className="text-primary">Filters</Form.Label><br></br>
            <Form.Label className="mt-3 text-primary">Chat Search</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by message or session ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <Button variant="outline-secondary" onClick={() => setSearch("")}>
                  <X size={16} />
                </Button>
              )}
            </InputGroup>
            <Form.Label className="mt-2 text-primary">Date Range</Form.Label>

            <Row>
              <Col>
                <Form.Label className="mt-2 text-primary">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Label className="mt-2 text-primary">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Form.Label className="mt-3 text-primary">Intent</Form.Label>
              {intents.map((intent) => (
                <Col
                  key={intent}
                  xs={12}
                  sm={6}

                  className="mb-2"
                >
                  <Form.Check
                    key={intent}
                    type="checkbox"
                    className="text-truncate"
                    label={intent}
                    checked={selectedIntents.includes(intent)}
                    onChange={() => toggleIntent(intent)}
                  />
                </Col>
              ))}
            </Row>

            <div className="text-end mt-1">
              <Button
                className="text-light"
                style={{ cursor: "pointer", backgroundColor: "#0d3357", fontSize: "13px" }}
                onClick={() => setSelectedIntents([])}
              >
                Clear all
              </Button>
            </div>

            <Form.Label className="mt-3 text-primary">Confidence Range</Form.Label>
            <div className="d-flex justify-content-between small">
              <span>Min {confidence[0]}%</span>
              <span>Max {confidence[1]}%</span>
            </div>
            <Form.Range
              min={0}
              max={100}
              value={confidence[0]}
              onChange={(e) =>
                setConfidence([Number(e.target.value), confidence[1]])
              }
            />
            <Form.Range
              min={0}
              max={100}
              value={confidence[1]}
              onChange={(e) =>
                setConfidence([confidence[0], Number(e.target.value)])

              }
            />

            <Form.Label className="mt-3 text-primary">Status</Form.Label>

            <Row className="mt-2">
              {[" Resolved", " Pending", " Escalated", " Failed"].map((status) => (
                <Col
                  key={status}
                  md={6}

                  className="mb-2"
                >
                  <Form.Check
                    type="checkbox"
                    label={status}
                    checked={statusFilter.includes(status)}
                    onChange={() =>
                      setStatusFilter((prev) =>
                        prev.includes(status)
                          ? prev.filter((s) => s !== status)
                          : [...prev, status]
                      )
                    }
                  />
                </Col>
              ))}
            </Row>

            <Row className="mt-2">
              <Form.Label className="mt-3 text-primary">Sentiment</Form.Label>
              {[
                { label: "All", value: "All" },
                { label: "Positive 😊", value: "Positive" },
                { label: "Neutral 😐", value: "Neutral" },
                { label: "Negative ☹️", value: "Negative" },
              ].map((item) => (

                <Col
                  key={item.value}
                  md={6}

                  className="mb-2"
                >
                  <Form.Check
                    key={item.value}
                    type="radio"
                    name="sentiment"
                    label={item.label}
                    checked={sentiment === item.value}
                    onChange={() => setSentiment(item.value)}
                    style={{ accentColor: "#1e7bd9" }}
                  />
                </Col>
              ))}
            </Row>




            <Col xs={12} lg={4} className="bg-light p-2 border rounded mt-2" style={{ maxHeight: "90vh", }}>


              <div className="mt-3" >
                {conversations
                  .filter(conv =>
                    conv.user.toLowerCase().includes(search.toLowerCase()) ||
                    conv.id.toLowerCase().includes(search.toLowerCase()) ||
                    conv.firstMessage.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(conv => (

                    <div
                      key={conv.id}
                      className={`d-flex flex-column flex-md-row align-items-start align-items-md-center p-2 mb-2 border rounded
          ${selectedConversation?.id === conv.id ? "bg-light" : ""} `}
                      style={{ cursor: "pointer",overflowY: "auto" }}
                      onClick={() => setSelectedConversation(conv)}
                    >


                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-md-3 mb-2 mb-md-0"
                        style={{
                          width: "44px",
                          height: "44px",
                          backgroundColor: "#165d9c",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          flexShrink: 0
                        }}
                      >
                        {conv.avatar}
                      </div>

                      <div className="flex-grow-1 w-100">

                        <div className="d-flex justify-content-between align-items-start">
                          <span className="fw-bold text-truncate me-2">
                            {conv.firstMessage}
                          </span>
                          <small className="text-muted text-nowrap">
                            {conv.lastTimestamp}
                          </small>
                        </div>


                        <div className="d-flex flex-wrap align-items-center gap-2 mt-1">

                          <span className="badge bg-secondary">
                            {conv.intent}
                          </span>


                          <div className="progress flex-grow-1" style={{ height: "5px", minWidth: "40px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${conv.confidence}%` }}
                              aria-valuenow={conv.confidence}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>


                          <div className="d-flex align-items-center gap-1 ms-md-auto">


                            <span
                              className={`badge ${conv.status === "Resolved"
                                ? "text-dark"
                                : conv.status === "Pending"
                                  ? "text-dark"
                                  : conv.status === "Escalated"
                                    ? " text-dark"
                                    : "text-dark"
                                }`}
                            >
                              {conv.status}
                            </span>
                          </div>

                        </div>

                        <small className="text-muted d-block mt-1">
                          {conv.id}
                        </small>

                      </div>
                    </div>
                  ))}
              </div>



              <div className="d-flex gap-2 mt-4">
                <Button className="w-100"
                  style={{ backgroundColor: "#0d3357" }}>
                  Apply
                </Button>
                <Button variant="outline-secondary" className="w-100" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              <div className="mt-4">
                <Form.Label>Items per page</Form.Label>
                <Form.Select
                  size="sm"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="mb-2"
                >
                  <option value={5}>5</option>

                </Form.Select>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                    <small className="text-muted">
                      Page {currentPage} of {totalPages}
                    </small>

                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            Prev
                          </button>
                        </li>

                        {[...Array(totalPages)].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>

            </Col>


            <Col
              xs={12}
              lg={8}
              className="bg-light p-3 border rounded h-100 d-flex flex-column"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              {selectedConversation ? (
                <>

                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <div>
                      <h5 className="mb-1">{selectedConversation.user}</h5>
                      <small className="text-muted">
                        Session: {selectedConversation.id} | Started: 2026-01-14 10:00 | Duration: 12m
                      </small>
                      <div>
                        <span className="badge bg-secondary me-1">Web</span>

                      </div>
                    </div>


                    <div className="d-flex gap-2  p-2 rounded">
                      <Form.Select
                        size="sm"
                        className="me-2"
                        style={{ maxWidth: "150px" }}
                      >
                        <option>
                          Export PDF
                        </option>
                        <option>
                          Export JSON
                        </option>
                        <option>Flag</option>
                        <option>Delete</option>
                        <option>Escalate</option>
                      </Form.Select>

                    </div>
                  </div>


                  <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: "50vh" }}>
                    {[
                      { type: "user", text: "Hi, I need help with my order", timestamp: "10:01", intent: "Order Status", confidence: 82, entities: ["OrderID"] },
                      { type: "bot", text: "Sure! Can you provide your order ID?", timestamp: "10:02" },
                      { type: "user", text: "Order12345", timestamp: "10:03", intent: "Order Status", confidence: 95, entities: [] },
                      { type: "agent", text: "Checking your order details...", timestamp: "10:05" },
                    ].map((msg, idx) => (
                      <div key={idx} className={`d-flex mb-2 ${msg.type === "user" ? "justify-content-end" : "justify-content-start"}`}>
                        <div
                          className="p-2 rounded"
                          style={{
                            backgroundColor: msg.type === "user" ? "#165d9c" : msg.type === "bot" ? "#4fa3ff" : "#94a3b8",
                            color: msg.type === "user" || msg.type === "agent" ? "white" : "black",
                            maxWidth: "70%"
                          }}
                        >
                          <p className="mb-1">{msg.text}</p>
                          {msg.type === "user" && (
                            <small className="d-block text-light">
                              Intent: {msg.intent} | Confidence: {msg.confidence}%
                              {msg.entities.length > 0 && (
                                <details>
                                  <summary>Entities</summary>
                                  <ul>
                                    {msg.entities.map((e, i) => <li key={i}>{e}</li>)}
                                  </ul>
                                </details>
                              )}
                            </small>
                          )}
                          <small className={`d-block ${msg.type === "user" ? "text-light" : "text-muted"}`} style={{ fontSize: "10px" }}>
                            {msg.timestamp}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>


                  <div className="border-top pt-2">
                    <h6>Analytics</h6>
                    <div className="d-flex flex-wrap gap-3">
                      <span>Sentiment: 😊 Positive</span>
                      <span>Average Confidence: 88%</span>
                      <span>Intents Triggered: Order Status (2), Payment Issue (1)</span>
                      <span>Resolution Status: Pending</span>
                      <span>Feedback:"Quick response, thanks!"</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                  <p>Select a conversation to view details</p>
                </div>
              )}
            </Col>



          </Row>
        </>
      },]
  };

  return (
    <div className="h-100">
      <TabComponent pageContent={pageContent}></TabComponent>
    </div>
  );
};





export default ConversationManager;
