import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, onlClick, selected, online }) {
  return (
    <div
      onClick={() => onlClick(id)}
      className={
        "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-blue-50" : "")
      }
      key={id}>
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={id} />
        <span className="text-grey-800"> {username}</span>
      </div>
    </div>
  );
}
