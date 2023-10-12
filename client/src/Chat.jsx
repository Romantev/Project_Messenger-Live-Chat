import { useContext, useEffect, useRef, useState } from "react";

import axios from "axios";
import Logo from "./Logo";
import ChatSymbol from "./ChatSymbol";

import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";
import Contact from "./Contact";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setnewMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  const { username, id, setId, setUsername } = useContext(UserContext);

  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  // WEBSOCKET
  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:3001");
    setWs(ws);
    ws.addEventListener("message", handelMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });
  };

  // SHOW ONLINE PEOPLE
  const showOnlinePeople = (peopleArray) => {
    const people = [];
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  // SHOW OFFLINE PEOPLE
  useEffect(() => {
    axios.get("/api/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  // HANDLE MESSAGE
  const handelMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  // SEND MESSAGE
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessageText.length > 0) {
      ws.send(
        JSON.stringify({
          recipient: selectedUserId,
          text: newMessageText,
        })
      );
      setnewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  };

  // LOGOUT FUNCTION
  const logout = () => {
    axios.post("api/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  };

  // SCORLLS DOWN BY NEW MESSAGES
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // SAVE CHAT TO DATABASE
  useEffect(() => {
    if (selectedUserId) {
      axios.get("/api/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
  const messageWithoutDupes = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className=" bg-white w-1/3 flex flex-col ">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onlClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onlClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            {username}
          </span>
          <button
            className=" text-gray-500 bg-blue-100 py-1 px-2 border rounded-sm"
            onClick={logout}>
            logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="h-full flex items-center justify-center">
              <h2 className="text-gray-400">&larr; Select your contact</h2>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="absolute top-0 left-0 right-0 bottom-2 overflow-y-scroll">
                {messageWithoutDupes.map((message) => (
                  // SINGLE MESSAGE
                  <div
                    key={message._id}
                    className={
                      message.sender === id ? " text-right " : "text-left"
                    }>
                    <div
                      className={
                        "text-left inline-block py-2 px-4 my-2 rounded-xl " +
                        (message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }>
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="  flex gap-2 " onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setnewMessageText(e.target.value)}
              type="text"
              placeholder="Type your message here"
              className="bg-white flex-grow border rounded-sm p-2"
            />
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-sm">
              <ChatSymbol />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
