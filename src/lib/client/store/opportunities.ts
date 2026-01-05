import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "src/lib/client/firebase";

export type Opportunity = {
  id: string;
  name: string;
  location: string;
  linkedin: string;
  pdfFile: string;
};

class OpportunitiesStore {
  posts: Opportunity[] = [];

  // opportunity posts are public - OK for client access
  async getPosts(): Promise<Opportunity[]> {
    if (this.posts.length) {
      return this.posts;
    } else {
      await getDocs(collection(db, "opportunity-posts"))
        .then((querySnapshot) => {
          const newData: any = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          const sortedData = newData.sort((a: Opportunity, b: Opportunity) =>
            a.name.localeCompare(b.name)
          );
          this.posts = sortedData;
          console.log("fetched Posts");
          console.log(this.posts);
        })
        .catch((err) => {
          console.log(err);
        });
      return this.posts;
    }
  }

  // opportunity posts are public - OK for client access
  async getPost(id: string): Promise<Opportunity | false> {
    if (this.posts.length) {
      return this.posts.find((post) => post.id === id) ?? false;
    } else {
      await getDocs(collection(db, "opportunity-posts"))
        .then((querySnapshot) => {
          const newData: any = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          this.posts = newData;
          console.log("fetched Posts");
          console.log(this.posts);
        })
        .catch((err) => {
          console.log(err);
        });
      return this.posts.find((post) => post.id === id) ?? false;
    }
  }

  // admin only - rely on firestore rules for admin check (not that this method actually calls firestore!)
  updatePost(id: string, post: Opportunity) {
    if (this.posts.length) {
      const isIndex = (post: Opportunity) => post.id == id;
      const index = this.posts.findIndex(isIndex);
      this.posts[index] = post;
      this.posts.sort((a: Opportunity, b: Opportunity) =>
        a.name.localeCompare(b.name)
      );
    }
  }

  // admin only - rely on firestore rules for admin check (not that this method actually calls firestore!)
  addPost(post: Opportunity) {
    this.posts.push(post);
    this.posts.sort((a: Opportunity, b: Opportunity) =>
      a.name.localeCompare(b.name)
    );
  }

  // admin only - rely on firestore rules for admin check
  async deletePost(post: Opportunity) {
    await deleteDoc(doc(db, "opportunity-posts", post.id))
      .then(() => {
        const isIndex = (allPost: Opportunity) => allPost.id == post.id;
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

export const opportunitiesStore = new OpportunitiesStore();
