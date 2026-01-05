import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "src/lib/client/firebase";
import type { NewOrder } from "../../../types/order";
import { InternalUser } from "src/types/user";

class OrderStore {
  orders: NewOrder[] = [];

  // admin only - rely on admin firestore rules
  async getOrders(): Promise<NewOrder[] | null> {
    await getDocs(collection(db, "new_orders"))
      .then((querySnapshot) => {
        const newData: any = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        this.orders = newData;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
    // console.log(this.orders);
    return this.orders;
  }

  // authorised user only - rely on user auth firestore rules (userId on document == uid)
  async getOrdersByUser(user: InternalUser): Promise<NewOrder[] | null> {
    if (user.isAdmin) {
      return await this.getOrders();
    }
    const ordersRef = collection(db, "new_orders");
    const q = query(ordersRef, where("userId", "==", user.id));
    await getDocs(q)
      .then((querySnapshot) => {
        const newData: any = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        this.orders = newData;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
    // console.log(this.orders);
    return this.orders;
  }

  invalidateCache() {
    this.orders = [];
  }

  // authorised user only - rely on user auth firestore rules (userId on document == uid)
  async getOrder(user: InternalUser, id: string): Promise<NewOrder | null> {
    if (this.orders.length) {
      return this.orders.find((post) => post.id === id) ?? null;
    } else {
      await this.getOrdersByUser(user);
      return this.orders.find((post) => post.id === id) ?? null;
    }
  }

  // just updates local
  addOrder(order: NewOrder): void {
    this.orders.push(order);
  }

  // just updates local
  updateOrderStatus(order: NewOrder, update: Partial<NewOrder>) {
    const newOrder: NewOrder = { ...order, ...update };
    console.log({ newOrder });
    if (this.orders.length) {
      const isIndex = (post: NewOrder) => order.id == post.id;
      const index = this.orders.findIndex(isIndex);
      this.orders[index] = newOrder;
    }
  }
}

export const orderStore = new OrderStore();
