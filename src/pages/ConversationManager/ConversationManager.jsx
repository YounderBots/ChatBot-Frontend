import React, { useState } from "react";
import { Card, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { Search, X } from "lucide-react";
import Select from "react-select";


const ConversationManager = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const [selectedIntents, setSelectedIntents] = useState([]);
  const [confidence, setConfidence] = useState([0, 100]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sentiment, setSentiment] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedConversation, setSelectedConversation] = useState(null);


  const totalPages = 10

  const conversations = [
    {
      id: "sess1",
      user: "Johnson",
      avatar: "J",
      firstMessage: "Hi, I need help with my order",

      startDate: "2026-01-14",
      endDate: "2026-01-14",
      lastTimestamp: "2026-01-14 10:35",

      intent: "Order",
      confidence: 82,
      sentiment: "Positive",

      unread: true,
      status: "Pending",

      messages: [
        {
          type: "user",
          text: "Hi, I need help with my order",
          timestamp: "10:01",
          intent: "Order Status",
          confidence: 82,
          sentiment: "Positive",
          entities: ["OrderID"],
        },
        { type: "bot", text: "Sure! Can you provide your order ID?", timestamp: "10:02" },
        {
          type: "user",
          text: "Order12345",
          timestamp: "10:03",
          intent: "Order Status",
          confidence: 95,
          sentiment: "Positive",
          entities: [],
        },
        { type: "agent", text: "Checking your order details...", timestamp: "10:05" },
      ],
    },

    {
      id: "sess2",
      user: "Smith",
      avatar: "S",
      firstMessage: "Payment not reflecting",

      startDate: "2026-01-13",
      endDate: "2026-01-13",
      lastTimestamp: "2026-01-13 18:20",

      intent: "Payment",
      confidence: 90,
      sentiment: "Neutral",

      unread: false,
      status: "Resolved",

      messages: [
        {
          type: "user",
          text: "Payment not reflecting",
          timestamp: "09:45",
          intent: "Payment Issue",
          confidence: 90,
          sentiment: "Neutral",
          entities: [],
        },
        { type: "bot", text: "Please provide transaction ID", timestamp: "09:46" },
      ],
    },

    {
      id: "sess3",
      user: "Caroline",
      avatar: "C",
      firstMessage: "I was charged twice",

      startDate: "2026-01-12",
      endDate: "2026-01-12",
      lastTimestamp: "2026-01-12 14:10",

      intent: "Complaint",
      confidence: 65,
      sentiment: "Negative",

      unread: true,
      status: "Escalated",

      messages: [
        {
          type: "user",
          text: "I was charged twice for my order",
          timestamp: "14:01",
          intent: "Billing Issue",
          confidence: 65,
          sentiment: "Negative",
          entities: ["Amount"],
        },
        { type: "bot", text: "Sorry for the inconvenience. Let me check.", timestamp: "14:02" },
        { type: "agent", text: "Escalating this issue to billing team.", timestamp: "14:05" },
      ],
    },

    {
      id: "sess4",
      user: "Lee",
      avatar: "L",
      firstMessage: "App is crashing on login",

      startDate: "2026-01-11",
      endDate: "2026-01-11",
      lastTimestamp: "2026-01-11 11:50",

      intent: "Greeting",
      confidence: 72,
      sentiment: "Negative",

      unread: false,
      status: "Failed",

      messages: [
        {
          type: "user",
          text: "App crashes every time I login",
          timestamp: "11:45",
          intent: "Technical Issue",
          confidence: 72,
          sentiment: "Negative",
          entities: ["Device"],
        },
        { type: "bot", text: "Please try clearing cache or reinstalling the app.", timestamp: "11:46" },
      ],
    },

    {
      id: "sess5",
      user: "Brown",
      avatar: "B",
      firstMessage: "Thanks, issue resolved",

      startDate: "2026-01-10",
      endDate: "2026-01-10",
      lastTimestamp: "2026-01-10 16:30",

      intent: "Order",
      confidence: 88,
      sentiment: "Positive",

      unread: false,
      status: "Resolved",

      messages: [
        {
          type: "user",
          text: "Thanks, my issue is resolved now",
          timestamp: "16:25",
          intent: "General Inquiry",
          confidence: 88,
          sentiment: "Positive",
          entities: [],
        },
        { type: "agent", text: "Glad to hear that!", timestamp: "16:26" },
      ],
    },
  ];

  const [filteredConversations, setFilteredConversations] = useState(conversations);
  const handleApplyFilters = () => {

    let filtered = [...conversations];

    if (startDate) {
      filtered = filtered.filter(
        (c) => new Date(c.startDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (c) => new Date(c.endDate) <= new Date(endDate)
      );
    }

    if (statusFilter.length > 0) {
      const selectedStatus = statusFilter.map((s) => s.value);
      filtered = filtered.filter((c) =>
        selectedStatus.includes(c.status)
      );
    }

    if (sentiment.length > 0 && !sentiment.some(s => s.value === "All")) {
      const selectedSentiments = sentiment.map((s) => s.value);
      filtered = filtered.filter((c) =>
        selectedSentiments.includes(c.sentiment)
      );
    }

    if (selectedIntents.length > 0) {
      const intents = selectedIntents.map((i) => i.value);
      filtered = filtered.filter((c) =>
        intents.includes(c.intent)
      );
    }

    filtered = filtered.filter(
      (c) =>
        c.confidence >= confidence[0] &&
        c.confidence <= confidence[1]
    );

    setFilteredConversations(filtered);
    console.log(filtered);
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

  const getVisiblePages = () => {
    const maxVisible = 3;
    let start = Math.max(currentPage - 1, 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  };


  return (


    <Card className="">
      <Card.Body>
        <h1 className="font-weight-bold text-cvq-blue-900 mb-0">Conversation</h1>

        <Row className="g-3 mt-1">
          <Col xs={4} md={6} lg={3}>
            <div className="input-group bg-white border rounded-3 shadow-sm ">
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
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearch("")}
                  >
                    <X size={16} />
                  </Button>
                )}
              </InputGroup>
            </div>
          </Col>

          <Col xs={4} md={6} lg={3}>
            <div className=" bg-white border rounded-3 shadow-sm ">
              <Form.Control
                className="border-0 shadow-none text-cvq-text"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </Col>

          <Col xs={4} md={6} lg={3}>
            <div className=" bg-white border rounded-3 shadow-sm ">
              <Form.Control
                className="border-0 shadow-none text-cvq-text"
                type="date"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </Col>

          <Col xs={4} md={6} lg={3}>
            <div className="input-group bg-white rounded-3 shadow-sm">
              <Select
                isMulti
                className="w-100"
                placeholder="Select Status"
                options={[
                  { value: "Resolved", label: "Resolved" },
                  { value: "Pending", label: "Pending" },
                  { value: "Escalated", label: "Escalated" },
                  { value: "Failed", label: "Failed" },
                ]}
                value={statusFilter}
                onChange={(selected) => setStatusFilter(selected)}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  }),
                  container: (base) => ({
                    ...base,
                    border: "none",
                  }),
                }}
              />
            </div>
          </Col>


          <Col xs={4} md={6} lg={3}>

            <div className="input-group bg-white rounded-3 shadow-sm">
              <Select
                isMulti
                className="w-100"
                placeholder="Select Sentiment"
                options={[
                  { value: "All", label: "All" },
                  { value: "Positive", label: "Positive" },
                  { value: "Negative", label: "Negative" },
                  { value: "Neutral", label: "Neutral" },
                ]}
                value={sentiment}
                onChange={(selected) => setSentiment(selected)}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  }),
                  container: (base) => ({
                    ...base,
                    border: "none",
                  }),
                }}
              />
            </div>
          </Col>

          <Col xs={4} md={6} lg={3}>

            <div className="input-group bg-white rounded-3 shadow-sm">
              <Select
                isMulti
                className="w-100"
                placeholder="Select Intent"
                options={[
                  { value: "Greeting", label: "Greeting" },
                  { value: "Order", label: "Order" },
                  { value: "Payment", label: "Payment" },
                  { value: "Complaint", label: "Complaint" },
                ]}
                value={selectedIntents}
                onChange={(selected) => setSelectedIntents(selected)}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  }),
                  container: (base) => ({
                    ...base,
                    border: "none",
                  }),
                }}
              />
            </div>
          </Col>


          <Col xs={12} md={12} lg={6}>
            <Form.Label className="text-primary">Confidence Range</Form.Label>

            <div className="d-flex justify-content-between small p-3">
              <span >Min {confidence[0]}%</span>
              <span>Max {confidence[1]}%</span>
            </div>

            <Form.Range
              className="p-3"
              min={0}
              max={100}
              value={confidence[0]}
              onChange={(e) =>
                setConfidence([Number(e.target.value), confidence[1]])
              }
            />

            <Form.Range
              className="p-3"
              min={0}
              max={100}
              value={confidence[1]}
              onChange={(e) =>
                setConfidence([confidence[0], Number(e.target.value)])
              }
            />
          </Col>

          <div className="d-flex gap-2 mb-2">
            <Button className="px-4"
              style={{ backgroundColor: "#0d3357", }}
              onClick={handleApplyFilters}>
              Apply
            </Button>
            <Button variant="outline-secondary" className="px-4" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          <Col xs={12} lg={4} className="bg-light p-1 border rounded " style={{ maxHeight: "90vh", }}>
            <div className="mt-3 g-2" >
              {filteredConversations
                .filter(conv =>
                  conv.user.toLowerCase().includes(search.toLowerCase()) ||
                  conv.id.toLowerCase().includes(search.toLowerCase()) ||
                  conv.firstMessage.toLowerCase().includes(search.toLowerCase())

                )
                .map(conv => (

                  <div
                    key={conv.id}
                    className={`d-flex flex-column flex-md-row align-items-start align-items-md-center 
                       ${selectedConversation?.id === conv.id ? "bg-light" : ""} `}
                    style={{ cursor: "pointer", overflowY: "auto" }}
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

            <div className="mt-4">

              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Prev
                  </button>

                  {getVisiblePages().map((page) => (
                    <button
                      key={page}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
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
                      Session: {selectedConversation.id} | Last Active: {selectedConversation.lastTimestamp} | 12mins ago

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
                  {selectedConversation.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`d-flex mb-2 ${msg.type === "user" ? "justify-content-end" : "justify-content-start"
                        }`}
                    >
                      <div
                        className="p-2 rounded"
                        style={{
                          backgroundColor:
                            msg.type === "user"
                              ? "#165d9c"
                              : msg.type === "bot"
                                ? "#4fa3ff"
                                : "#94a3b8",
                          color:
                            msg.type === "user" || msg.type === "agent"
                              ? "white"
                              : "black",
                          maxWidth: "70%",
                        }}
                      >
                        <p className="mb-1">{msg.text}</p>

                        {msg.type === "user" && (
                          <small className="d-block text-light">
                            Intent: {msg.intent} | Confidence: {msg.confidence}%
                            {msg.entities?.length > 0 && (
                              <details>
                                <summary>Entities</summary>
                                <ul>
                                  {msg.entities.map((e, i) => (
                                    <li key={i}>{e}</li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </small>
                        )}

                        <small
                          className={`d-block ${msg.type === "user" ? "text-light" : "text-muted"
                            }`}
                          style={{ fontSize: "10px" }}
                        >
                          {msg.timestamp}
                        </small>
                      </div>
                    </div>

                  ))}
                </div>



                <div className="border-top pt-2">
                  <h6>Analytics</h6>
                  <div className="d-flex flex-wrap gap-3">
                    <span>Sentiment: {selectedConversation.sentiment}</span>
                    <span>Confidence: {selectedConversation.confidence}%</span>
                    <span>Intent: {selectedConversation.intent}</span>
                    <span>Status: {selectedConversation.status}</span>
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
      </Card.Body>
    </Card>



  );
};


export default ConversationManager;
