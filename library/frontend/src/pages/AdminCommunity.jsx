import { useState, useEffect } from 'react';
import { Container, Box, Grid, Card, CardHeader, CardContent, CardActions, Typography, TextField, Avatar, IconButton, Rating, Chip } from '@mui/material';
import { Delete as DeleteIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';

export default function AdminCommunity() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    setPosts(institution.communityPosts || []);
  }, []);

  const handleDelete = (postId) => {
    const updatedPosts = posts.filter(p => p.postId !== postId);
    setPosts(updatedPosts);
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    const updatedInstitution = { ...institution, communityPosts: updatedPosts };
    localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
  };

  const filteredPosts = posts.filter(post =>
    post.bookTitle.toLowerCase().includes(filter.toLowerCase()) ||
    post.studentName.toLowerCase().includes(filter.toLowerCase()) ||
    post.reviewText.toLowerCase().includes(filter.toLowerCase())
  );

  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
  const averageRating = posts.reduce((sum, post) => sum + post.rating, 0) / posts.length || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          Community Reviews
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search reviews..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 350 }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={600}>{posts.length}</Typography>
              <Typography color="text.secondary">Total Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={600}>{totalLikes}</Typography>
              <Typography color="text.secondary">Total Likes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={600}>{averageRating.toFixed(1)}</Typography>
              <Typography color="text.secondary">Average Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredPosts.map(post => (
          <Grid item key={post.postId} xs={12} md={6} lg={4}>
            <Card>
              <CardHeader
                avatar={<Avatar>{post.studentName.charAt(0)}</Avatar>}
                title={post.bookTitle}
                subheader={`By ${post.studentName} on ${new Date(post.date).toLocaleDateString()}`}
                action={
                  <IconButton onClick={() => handleDelete(post.postId)}>
                    <DeleteIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Rating value={post.rating} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {post.reviewText}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <Chip icon={<ThumbUpIcon />} label={`${post.likes.length} likes`} variant="outlined" />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPosts.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ mt: 8 }}>
          {filter ? 'No reviews found matching your search.' : 'No reviews yet.'}
        </Typography>
      )}
    </Container>
  );
}
