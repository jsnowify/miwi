import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import AppFrame from '../components/AppFrame';
import PostItem from '../components/PostItem';
export default function PostDetail() {
  const { id } = useParams(), { user } = useAuth();
  const post = useQuery({ queryKey: ['post', user.id, id], queryFn: () => api(`/posts/${id}`), retry: false });
  return <AppFrame title="A little check-in">{post.isPending ? <p role="status">Loading…</p> : post.error ? <p role="alert">This post is unavailable. It may have been removed or its sharing permissions changed.</p> : <PostItem post={post.data} />}<Link to="/feed">Back to your circle</Link></AppFrame>;
}