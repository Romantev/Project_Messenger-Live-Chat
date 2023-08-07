import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Avatar from "./Avatar";
import Logo from "./Logo";
import ChatSymbol from "./ChatSymbol";
import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setnewMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  const { username, id } = useContext(UserContext);

  const divUnderMessages = useRef();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    setWs(ws);

    ws.addEventListener("message", handelMessage);
  }, []);

  // SHOW ONLINE PEOPLE
  const showOnlinePeople = (peopleArray) => {
    const people = [];
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  // HANDLE MESSAGE
  const handelMessage = (e) => {
    const messageData = JSON.parse(e.data);
    console.log({ e, messageData });
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  // SEND MESSAGE
  const sendMessage = (e) => {
    e.preventDefault();
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
        id: Date.now(),
      },
    ]);
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
      axios.get("/messages/" + selectedUserId);
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
  const messageWithoutDupes = uniqBy(messages, "id");

  return (
    <div className="flex h-screen">
      <div className=" bg-white w-1/3 ">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map((userId) => (
          <div
            onClick={() => setSelectedUserId(userId)}
            className={
              "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
              (userId === selectedUserId ? "bg-blue-50" : "")
            }
            key={userId}
          >
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-grey-800"> {onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
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
                    className={
                      message.sender === id ? " text-right " : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block py-2 px-4 my-2 rounded-xl " +
                        (message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }
                    >
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
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <ChatSymbol />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
