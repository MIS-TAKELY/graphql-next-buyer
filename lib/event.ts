// // lib/events.ts

// import redis from "@/config/redis";

// const { publisher } = redis;

// export async function publishNewMessage(data: any) {
//   if (!publisher) return console.error("Upstash publisher missing");

//   await publisher.publish("message.newMessage", data);
// }

// export async function publishNewOrder(data: any) {
//   if (!publisher) return console.error("Upstash publisher missing");

//   await publisher.publish("order.newOrder", data);
// }

// export async function publishOrderStatusUpdate(data: any) {
//   if (!publisher) return console.error("Upstash publisher missing");

//   await publisher.publish("order.statusChanged", data);
// }
