import { useState, useEffect } from "react";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LikeButton = ({ record_id, current_user_id, user_name, user_email,likesTableName }) => {
  const [liked, setLiked] = useState(false);
  const [likedByOthers, setLikedByOthers] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from(likesTableName)
        .select("likes_count, current_user_id")
        .eq("record_id", record_id);

      if (!error && data) {

        const totalLikes = data.length;
        setLikesCount(totalLikes);
        const userLiked = data.some(like => like.current_user_id === current_user_id);
        const otherUserLiked = data.some(like => like.current_user_id != current_user_id);
        setLiked(userLiked);
        setLikedByOthers(otherUserLiked);
      } else {
        setLikesCount(0);
        setLiked(false);
        setLikedByOthers(false);

      }
    };

    fetchLikes();
  }, [record_id, current_user_id]);

  const handleLikeToggle = async () => {
    if (liked) {
      const { error } = await supabase
        .from(likesTableName)
        .delete()
        .eq("record_id", record_id)
        .eq("current_user_id", current_user_id);

      if (!error) {
        setLiked(false);
        setLikesCount(prev => Math.max(prev - 1, 0));
      }
    } else {
      const { error } = await supabase
        .from(likesTableName)
        .upsert([
          {
            record_id,
            current_user_id,
            user_name,
            user_email,
            likes_count: 1,
          },
        ], { onConflict: ["record_id", "current_user_id"] });

      if (!error) {
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    }
  };

  return (
    <div
      onClick={handleLikeToggle}
      className={`flex items-center space-x-1 transition duration-200 cursor-pointer ${liked ? "text-blue-500" : likedByOthers ? "text-white" : "text-gray-500"
        }`}
    >
      {liked || likedByOthers ? (
        <FaThumbsUp size={18} />
      ) : (
        <FaRegThumbsUp size={18} />
      )}
      <span className="mt-1">{likesCount}</span>
    </div>

  );
};

export default LikeButton;
