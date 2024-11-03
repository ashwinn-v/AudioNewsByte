// // src/components/ChatHistoryDialog.js

// import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { History } from 'lucide-react';
// import { Button } from "@/components/ui/button";

// const ChatHistoryDialog = ({ language, chatHistory }) => {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button className="bg-transparent hover:bg-[#F8F7FF] text-[#F8F7FF] font-bold py-3 px-6 border-2 border-[#F8F7FF] rounded-full shadow-lg flex items-center gap-2">
      
//           {language === 'EN' ? "History" : "Translated History"}
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="bg-[#0A0B2E] border-[#F8F7FF] text-[#F8F7FF]">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold pixelated">{language === 'EN' ? "Chat History" : "Translated Title"}</DialogTitle>
//         </DialogHeader>
//         <ul className="space-y-2 mt-4">
//           {chatHistory.map((entry, index) => (
//             <li key={index} className="bg-[#0A0B2E] border border-[#F8F7FF] rounded-lg p-4">
//               {entry}
//             </li>
//           ))}
//         </ul>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ChatHistoryDialog;
