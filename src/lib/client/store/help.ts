import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { HelpPage } from "src/types/helpPage";

class HelpStore {
  posts: HelpPage[] = [];

  // help pages are public - OK for client access
  async getHelpPages(): Promise<HelpPage[]> {
    if (this.posts.length) {
      return this.posts;
    } else {
      await getDocs(collection(db, "help-pages"))
        .then((querySnapshot) => {
          const newData: any = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          // const sortedData = newData.sort(
          //   (a: HelpPage, b: HelpPage) => b.publishedAt - a.publishedAt
          // );
          this.posts = newData;
        })
        .catch((err) => {
          console.log(err);
        });
      return this.posts;
    }
  }

  // help pages are public - OK for client access
  async getPost(id: string): Promise<HelpPage | false> {
    if (this.posts.length) {
      return this.posts.find((post) => post.id === id) ?? false;
    } else {
      await getDocs(collection(db, "help-pages"))
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
  updatePost(id: string, post: HelpPage) {
    if (this.posts.length) {
      const isIndex = (post: HelpPage) => post.id == id;
      const index = this.posts.findIndex(isIndex);
      this.posts[index] = post;
      // this.posts.sort(
      //   (a: HelpPage, b: HelpPage) => b.publishedAt - a.publishedAt
      // );
    }
  }

  // admin only - rely on firestore rules for admin check (not that this method actually calls firestore!)
  addPost(post: HelpPage) {
    this.posts.push(post);
    // this.posts.sort(
    //   (a: HelpPage, b: HelpPage) => b.publishedAt - a.publishedAt
    // );
  }

  // admin only - rely on firestore rules for admin check
  async deletePost(post: HelpPage) {
    await deleteDoc(doc(db, "help-pages", post.id))
      .then(() => {
        const isIndex = (allPost: HelpPage) => allPost.id == post.id;
        const index = this.posts.findIndex(isIndex);
        if (index > -1) {
          this.posts.splice(index, 1);
        }
        toast.success("Deleted help page");
      })
      .catch((error) => {
        toast.error("Unable to delete help page");
        console.log(error);
      });
    return;
  }
}

export const helpStore = new HelpStore();
