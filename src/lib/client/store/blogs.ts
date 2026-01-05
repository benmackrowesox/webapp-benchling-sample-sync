import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { Post } from "src/types/blog";

class BlogStore {
  posts: Post[] = [];

  // blog posts are public - OK for client access
  async getPosts(): Promise<Post[]> {
    if (this.posts.length) {
      return this.posts;
    } else {
      await getDocs(collection(db, "blog-posts"))
        .then((querySnapshot) => {
          const newData: any = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          const sortedData = newData.sort(
            (a: Post, b: Post) => b.publishedAt - a.publishedAt
          );
          this.posts = sortedData;
        })
        .catch((err) => {
          console.log(err);
        });
      return this.posts;
    }
  }

  // blog posts are public - OK for client access
  async getPost(id: string): Promise<Post | false> {
    if (this.posts.length) {
      return this.posts.find((post) => post.id === id) ?? false;
    } else {
      await getDocs(collection(db, "blog-posts"))
        .then((querySnapshot) => {
          const newData: any = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          this.posts = newData;
        })
        .catch((err) => {
          console.log(err);
        });
      return this.posts.find((post) => post.id === id) ?? false;
    }
  }

  // admin only - rely on firestore rules for admin check (not that this method actually calls firestore!)
  updatePost(id: string, post: Post) {
    if (this.posts.length) {
      const isIndex = (post: Post) => post.id == id;
      const index = this.posts.findIndex(isIndex);
      this.posts[index] = post;
      this.posts.sort((a: Post, b: Post) => b.publishedAt - a.publishedAt);
    }
  }

  // admin only - rely on firestore rules for admin check (not that this method actually calls firestore!)
  addPost(post: Post) {
    this.posts.push(post);
    this.posts.sort((a: Post, b: Post) => b.publishedAt - a.publishedAt);
  }

  // admin only - rely on firestore rules for admin check
  async deletePost(post: Post) {
    await deleteDoc(doc(db, "blog-posts", post.id))
      .then(() => {
        const isIndex = (allPost: Post) => allPost.id == post.id;
        const index = this.posts.findIndex(isIndex);
        if (index > -1) {
          this.posts.splice(index, 1);
        }
        toast.success("Deleted post");
      })
      .catch((error) => {
        toast.error("Unable to delete post");
        console.log(error);
      });
    return;
  }
}

export const blogStore = new BlogStore();
