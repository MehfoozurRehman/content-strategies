import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaCheck, FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import Alert from "./Alert";
import { appColors } from "@/lib/theme";

const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CommentModal = ({ row, onClose,commentsTableName }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [editedText, setEditedText] = useState("");
    const [commentMessage, setCommentMessage] = useState("");
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [showDeleteMessage, setDeleteMessage] = useState(false);

    // Get user email & roles from localStorage
    const userEmail = localStorage.getItem("email");

    // Check role permissions
    const storedRoles = localStorage.getItem("system_roles"); // e.g., "admin,editor"
    const systemRoles = storedRoles ? storedRoles.split(",") : [];
    
    const isAdmin = systemRoles.includes("admin") || systemRoles.includes("editor");
    
    console.log("storedRoles", storedRoles);
    console.log("systemRoles", systemRoles);
    console.log("isAdmin", isAdmin);

    // Fetch Comments on the basis of record id when modal is opened
    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase
                .from(commentsTableName)
                .select("*")
                .eq("Record_ID", row.id);

            if (error) {
                console.log("Error fetching comments:", error);
            } else {
                setComments(data);
            }
        };

        if (row?.id) {
            fetchComments();
        }
    }, [row, commentMessage]);

    // Handle Comment Submission
    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        const { data, error } = await supabase.from(commentsTableName).insert([
            {
                Record_ID: row.id,
                Comment: newComment,
                user_email: userEmail,
            },
        ]);

        if (error) {
            console.log("Error submitting comment:", error);
        } else {
            setNewComment("");
            setComments([...comments, { Comment: newComment, user_email: userEmail }]);
            setCommentMessage("Comment added successfully!");
            setTimeout(() => setCommentMessage(""), 3000);
        }
    };


    const handleDelete = async (id) => {
        Alert.show(
            "Confirm Deletion",
            "Are you sure to delete this comment?",
            [
                {
                    text: "Cancel",
                    onPress: () => { },
                    className: "mb-6", 
                },
                {
                    text: "Delete",
                    primary: true,
                    onPress: async () => {
                        if (id) {
                            const { error } = await supabase
                                .from(commentsTableName)
                                .delete()
                                .eq("id", id);

                            if (error) {
                                console.log("Error deleting comment:", error);
                            } else {
                                setComments((prevComments) =>
                                    prevComments.filter((comment) => comment.id !== id)
                                );
                                setDeleteMessage("Comment deleted successfully!");

                                setTimeout(() => setDeleteMessage(""), 3000);
                            }
                        }
                    },
                },
            ]
        );
    };


    // Handle Edit Comment
    const handleEdit = (comment) => {
        setEditingComment(comment.id);
        setEditedText(comment.Comment);
    };

    const handleUpdate = async (id) => {
        const { error } = await supabase
            .from(commentsTableName)
            .update({ Comment: editedText })
            .eq("id", id);

        if (error) {
            console.log("Error updating comment:", error);
        } else {
            setComments(
                comments.map((comment) =>
                    comment.id === id ? { ...comment, Comment: editedText } : comment
                )
            );
            setEditingComment(null);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50" >
            <div className="p-6 rounded-lg shadow-lg w-[45%] relative" style={{backgroundColor:appColors.primaryColor}}>
                <h2 className="text-2xl font-extrabold mb-4 -mt-2 border-b pb-2">
                    Manage All Comments
                </h2>

                {showDeleteMessage && (
                    <div className="mb-0 text-green-600  text-center flex justify-center items-center">
                        {showDeleteMessage}
                    </div>
                )}

                {/* Existing Comments */}
                {comments.length > 0 ? (
                    <ul className="mb-4 max-h-60 overflow-y-auto">
                        {comments.map((comment, index) => (
                            <li key={comment.id || `comment-${index}`} className="flex justify-between items-center border  p-2 rounded mb-2">
                                {editingComment === comment.id ? (
                                    <CustomInput
                                        type="text"
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                ) : (
                                    <span>{comment.Comment} - <span className="text-gray-600 text-sm">{comment.user_email}</span></span>
                                )}

                                {/* Show Edit/Delete buttons based on role */}
                                {(isAdmin || comment.user_email === userEmail) && (
                                    <div className="flex gap-2 ml-2" >
                                        {editingComment === comment.id ? (
                                            <>
                                                <div
                                                    onClick={() => handleUpdate(comment.id)}
                                                    className="flex items-center justify-center border border-green-600 text-green-600 hover:bg-green-600 hover:text-white cursor-pointer w-6 h-6 rounded"
                                                >
                                                    <FaCheck className="w-3.5 h-3.5" />
                                                </div>
                                                <div
                                                    onClick={() => setEditingComment(null)}
                                                    className="flex items-center justify-center border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white cursor-pointer w-6 h-6 rounded"
                                                >
                                                    <FaTimes className="w-3.5 h-3.5" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    onClick={() => handleEdit(comment)}
                                                    className="text-blue-500 hover:text-blue-700 cursor-pointer" 
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </div>
                                                <div
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}


                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No comments yet.</p>
                )}
                <CustomInput
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full border p-2 rounded mb-2"
                />

                <CustomButton
                    onClick={handleCommentSubmit}
                    title={"Add Comment"}
                    disabled={!newComment.trim()}
                    className="text-white px-4 py-2 mb-0 rounded w-full"
                />
                {commentMessage && (
                    <div className="mb-0 text-green-600  text-center flex justify-center items-center">
                        {commentMessage}
                    </div>
                )}
             

                {/* Close Modal */}
                <div onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-lg cursor-pointer">
                    ✖
                </div>
            </div>
        </div>
    );
};

export default CommentModal;