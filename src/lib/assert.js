export default function assert(val, message){
  if (!val) {
    throw new Error(message);
  }
}
