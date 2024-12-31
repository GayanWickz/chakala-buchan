import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./account.css";

const Account = () => {
  const customerId = localStorage.getItem("customerId");
  const [customer, setcustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/customeraccount/${customerId}`
        );
        setcustomer(response.data);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  // Fetch questions based on CustomerID
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/customerreply/reply?customerId=${customerId}`
        );
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (customerId) {
      fetchQuestions();
    }
  }, [customerId]);

  // WebSocket: Handle real-time replies
  const socket = io("http://localhost:3000");
  useEffect(() => {
    socket.on("update-replies", (newReply) => {
      setQuestions((prevQuestions) => [...prevQuestions, newReply]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch order items based on CustomerID
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/customerorder/orders?customerId=${customerId}`
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (customerId) {
      fetchOrders();
    }
  }, [customerId]);

  // WebSocket logic for real-time order updates
  useEffect(() => {
    socket.on("order-update", (updatedOrder) => {
      setOrders((prevOrders) => {
        const orderIndex = prevOrders.findIndex(
          (order) => order.orderId === updatedOrder.orderId
        );

        if (orderIndex !== -1) {
          const updatedOrders = [...prevOrders];
          updatedOrders[orderIndex] = updatedOrder;
          return updatedOrders;
        } else {
          return [...prevOrders, updatedOrder];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle deleting a question
  const handleDelete = async (questionId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/customerdeletereply/${questionId}`
      );

      if (response.data.success) {
        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question._id !== questionId)
        );
        socket.emit("delete-reply", questionId);
      } else {
        console.error("Error deleting question:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleClick = (productId) => {
    navigate(`/Product_details`, { state: { productId } });
  };

  return (
    <div>
      {customer ? (
        <div className="customer-profile-con">
          <img className="customer-profile-image" src="user-logo.png" />
          <div className="customer-profile-detail-con">
            <div className="customer-profile-detail">
              <h5 className="customer-profile-topic" htmlFor="">
                Customer ID :
              </h5>
              <p className="customer-profile-p">{customer._id}</p>
            </div>
            <div className="customer-profile-detail">
              <h5 className="customer-profile-topic" htmlFor="">
                Customer Name :
              </h5>
              <p className="customer-profile-p">{customer.CustomerName}</p>
            </div>
            <div className="customer-profile-detail">
              <h5 className="customer-profile-topic" htmlFor="">
                Customer Email :
              </h5>
              <p className="customer-profile-p">{customer.CustomerEmail}</p>
            </div>
            <div className="customer-profile-detail">
              <h5 className="customer-profile-topic" htmlFor="">
                Customer Address :
              </h5>
              <p className="customer-profile-p">{customer.CustomerAddress}</p>
            </div>
            <div className="customer-profile-detail">
              <h5 className="customer-profile-topic" htmlFor="">
                Customer PhoneNumber :
              </h5>
              <p className="customer-profile-p">
                {customer.CustomerPhoneNumber}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading seller details...</p>
      )}
      {}
      <div className="new-customer-order-container">
        <h3 className="customer-chat-head">My Orders</h3>
        <table className="new-customer-order-tbl">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td data-label="Order ID">{order.orderId}</td>
                <td data-label="Product Name">
                  {order.productId?.ProductName}
                </td>
                <td data-label="Quantity">{order.quantity}</td>
                <td data-label="Price">{order.price}</td>
                <td
                  data-label="Status"
                  className={`new-order-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {}
      <div className="customer-chat-container">
        <h3 className="customer-chat-head">My Chat</h3>
        <div className="customer-chat-tbl_content">
          <table className="customer-chat-tbl">
            <thead>
              <tr>
                <th></th>
                <th>Product Name</th>
                <th>Question</th>
                <th>Answer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question._id}>
                  <td onClick={() => handleClick(question.ProductID._id)}>
                    <img
                      className="customer-chat-table-image"
                      src={
                        `http://localhost:3000/uploads/${question.ProductID.ImageFile}` ||
                        "product.png"
                      }
                      alt="edit"
                    />
                  </td>
                  <td
                    data-label="Product Name"
                    onClick={() => handleClick(question.ProductID._id)}
                  >
                    {question.ProductID.ProductName}
                  </td>
                  <td
                    data-label="Question"
                    className="customer-chat-qa"
                    onClick={() => handleClick(question.ProductID._id)}
                  >
                    {question.Question}
                  </td>
                  <td
                    onClick={() => handleClick(question.ProductID._id)}
                    data-label="Answer"
                    className={`customer-chat-qa ${question.Answer}`}
                  >
                    {question.Answer}
                  </td>
                  <td data-label="Actions">
                    <button
                      className="wish-btn trash"
                      onClick={() => handleDelete(question._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {}
    </div>
  );
};

export default Account;
