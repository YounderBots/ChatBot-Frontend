import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import Select from "react-select";
import APICall from "../../APICalls/APICall";
import "./Conversation.css";

const ConversationManager = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const [selectedIntents, setSelectedIntents] = useState([]);
  const [confidence, setConfidence] = useState([0, 100]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [sentiment, setSentiment] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  const [Value, setValue] = useState(null);


  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {

      const data = await APICall.getT('/conversation/conversations')
      // const data = await res.json();
      console.log(data);



      const normalized = data.map(mapSessionToConversation);
      setConversations(normalized);
      setFilteredConversations(normalized);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
    }
  };

  const mapSessionToConversation = (session) => {
    const msgs = session.conversations || [];

    const firstUserMsg =
      msgs.find(m => m.sender === "user")?.message_text ||
      msgs[0]?.message_text ||
      "";

    const lastMsg = msgs[msgs.length - 1];

    const lastBotWithIntent = [...msgs]
      .reverse()
      .find(m => m.intent_detected);

    return {
      id: session.session_key,
      user: session.user_name || "Anonymous",
      avatar: (session.user_name?.[0] || "U").toUpperCase(),

      firstMessage: firstUserMsg,

      startDate: session.started_at?.split("T")[0],
      endDate: session.ended_at?.split("T")[0] || null,

      lastTimestamp: lastMsg
        ? new Date(lastMsg.created_at).toLocaleString()
        : "",

      intent: lastBotWithIntent?.intent_detected || "Unknown",
      confidence: lastBotWithIntent?.confidence_score
        ? Math.round(lastBotWithIntent.confidence_score * 100)
        : 0,

      sentiment: lastBotWithIntent?.sentiment || "Neutral",

      unread: true,
      status: session.status === "ACTIVE" ? "Pending" : session.status,

      messages: msgs.map(m => ({
        type:
          m.sender === "user"
            ? "user"
            : m.sender === "bot"
              ? "bot"
              : "agent",

        text: m.message_text,
        timestamp: new Date(m.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),

        intent: m.intent_detected,
        confidence: m.confidence_score
          ? Math.round(m.confidence_score * 100)
          : null,

        sentiment: m.sentiment,
        entities: []
      }))
    };
  };



  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);


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
    setCurrentPage(1);
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
    setCurrentPage(1);
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


  const exportJSON = () => {
    alert("Exporting conversation as JSON");
    if (!selectedConversation) return;

    const json = JSON.stringify(selectedConversation, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${selectedConversation.id}.json`;
    link.click();

    URL.revokeObjectURL(url);

  };

  const exportPDF = () => {
    alert("export PDF")
  }

  const flagConversation = () => {
    alert("Conversation flagged");
  };

  const deleteConversation = () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      console.log("Conversation deleted");
    }
  };

  const escalateConversation = () => {
    alert("Conversation escalated to agent");
  };


  const handleAction = (selectedOption) => {
    if (!selectedOption) return;

    const action = selectedOption.value;

    switch (action) {
      case "pdf":
        exportPDF();
        break;

      case "json":
        exportJSON();
        break;

      case "flag":
        flagConversation();
        break;

      case "delete":
        deleteConversation();
        break;

      case "escalate":
        escalateConversation();
        break;

      default:
        break;
    }

  };

  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const formatChatText = (text) => {
  //   if (!text) return "";

  //   return text
  //     // Bold **text**
  //     .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  //     // New line AFTER colon :
  //     .replace(/:\s*/g, ":")

  //     // New line BEFORE emojis / icons
  //     .replace(
  //       /(\p{Extended_Pictographic})/gu,
  //       "<br />$1"
  //     )
  //     .replace(
  //       /\u2022/gu,
  //       "<br /> &bull;"
  //     );
  // };


  const formatChatText = (text) => {
    if (!text) return "";

    return text
      // Escape HTML for safety
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

      // Headings (**Title:**)
      .replace(
        /^<strong>(.+?):<\/strong>$/gm,
        "<div class='chat-heading'>$1:</div>"
      )

      // Normalize bullets: ? or • → bullet row
      .replace(
        /^[?•]\s*(.+)$/gm,
        "<div class='chat-bullet'>• $1</div>"
      )

      // Paragraph spacing (double newline)
      .replace(/\n{2,}/g, "<div class='chat-gap'></div>")

      // Single newline
      .replace(/\n/g, "<br />");
  };

  return (

    <Card className="shadow-sm border-0 rounded-4 ">
      <Card.Body>
        <Row className="g-3 mb-3 ">
          <Col xs={4} md={6} lg={3}>
            <div className="input-group bg-white border rounded-3 shadow-sm ">
              <InputGroup>
                <InputGroup.Text>
                  <Search size={12} />
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
                className="border-0 shadow-none border text-cvq-text"
                type="date"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </Col>

          <Col xs={4} md={6} lg={3}>
            <div className="input-group bg-white rounded-3 border shadow-sm">
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
            <div className="input-group bg-white rounded-3 border shadow-sm">
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
            <div className="input-group bg-white rounded-3 border shadow-sm">
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

          <Col xs={12} md={12} lg={3}>
            <div className=" rounded-3 shadow-sm text-center border "

              style={{ cursor: "pointer", padding: "5px", textAlign: "center", backgroundColor: "#e2e8f0" }}

              onClick={() => setShowConfidenceModal(true)}
            >
              Confidence Range

            </div>
          </Col>

          <Col xs={12} md={12} lg={3}>
            <div className="d-flex gap-2 align-content-end justify-content-end">
              <Button className="p-1"
                style={{ backgroundColor: "#0d3357", width: "100px", height: "40px" }}
                onClick={handleApplyFilters}>
                Apply
              </Button>
              <Button variant="p-1" style={{ width: "100px", height: "40px", backgroundColor: "#cbd5e1" }} className="" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </Col>

          <div className="d-flex flex-column flex-lg-row gap-2 w-100 mt-3">
            <Col xs={12} lg={4} className="bg-light border rounded mt-3 " style={{ overflowY: "auto" }}>
              <div className="">
                {paginatedConversations
                  .filter(conv =>
                    conv.user.toLowerCase().includes(search.toLowerCase()) ||
                    conv.id.toLowerCase().includes(search.toLowerCase()) ||
                    conv.firstMessage.toLowerCase().includes(search.toLowerCase())

                  )
                  .map(conv => (

                    <div
                      key={conv.id}
                      className={`d-flex flex-md-row align-items-start align-items-md-center overflow-auto mb-2 rounded  p-2
                       ${selectedConversation?.id === conv.id ? "bg-light" : ""} `}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center m-2"
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
                          <small className="text-muted text-nowrap mb-0" style={{ fontSize: "10px" }}>
                            {conv.lastTimestamp}
                          </small>
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-1 mt-1">

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

              <div className="sticky-bottom bg-light">

                {totalPages > 1 && (
                  <div className="pagination-bar p-3">
                    <button
                      className="text-nowrap p-2"
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
                      className="text-nowrap p-2"
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
              className="bg-light rounded mt-3 d-flex flex-column"
              style={{
                height: window.innerWidth <= 576 ? "90vh" : "65vh",
              }}
            >
              {selectedConversation ? (
                <>

                  <div className="bg-light p-2 border-bottom d-flex justify-content-between flex-wrap gap-2 rounded-top-1">
                    <div>
                      <h6 className="mb-1">{selectedConversation.user}</h6>
                      <small className="text-muted">
                        Session: {selectedConversation.id} | Last Active:{" "}
                        {selectedConversation.lastTimestamp}
                      </small>
                      <div className="mt-1">
                        <span className="badge bg-secondary">Web</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <div style={{ minWidth: "140px" }}>
                        <Select
                          placeholder="Export"
                          value={Value}
                          options={[
                            { value: "pdf", label: "Export PDF" },
                            { value: "json", label: "Export JSON" },
                          ]}
                          onChange={(selected) => {
                            handleAction(selected);
                            setValue(null);
                          }}
                        />
                      </div>

                      <div style={{ minWidth: "140px" }}>
                        <Select
                          placeholder="Actions"
                          value={Value}
                          options={[
                            { value: "flag", label: "Flag" },
                            { value: "delete", label: "Delete" },
                            { value: "escalate", label: "Escalate" },
                          ]}
                          onChange={(selected) => {
                            handleAction(selected);
                            setValue(null);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow-1 overflow-auto px-2 py-3"
                    style={{ height: "65vh" }}>
                    {selectedConversation.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`d-flex mb-2 ${msg.type === "user"
                          ? "justify-content-end"
                          : "justify-content-start"
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
                            maxWidth: "85%",
                          }}
                        >
                          <div
                            className="mb-1 chat-text"
                            dangerouslySetInnerHTML={{
                              __html: formatChatText(msg.text),
                            }}
                          />

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
                  <div className="border-top bg-light p-2 small rounded-bottom-1">
                    <h6 className="mb-1">Analytics</h6>
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

          </div>


        </Row>

        <Modal
          show={showConfidenceModal}
          onHide={() => setShowConfidenceModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-primary">Confidence Range</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex justify-content-between small mb-2">
              <span>Min {confidence[0]}%</span>

              <span>Max {confidence[1]}%</span>
            </div>

            <Form.Range
              className="p-2"
              min={0}
              max={100}
              value={confidence[0]}
              onChange={(e) =>
                setConfidence([Number(e.target.value), confidence[1]])
              }
            />

            <Form.Range
              className="p-2"
              min={0}
              max={100}
              value={confidence[1]}
              onChange={(e) =>
                setConfidence([confidence[0], Number(e.target.value)])
              }
            />
          </Modal.Body>

        </Modal>
      </Card.Body>
    </Card >



  );
};


export default ConversationManager;
