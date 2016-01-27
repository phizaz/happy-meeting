let allRefs = [];

// all listener must be wrapped with this function
// for properly allOff function
export function wrap (ref) {
  allRefs.push(ref);
  console.log('allRefs:', allRefs);
  return ref;
};

export function allOff () {
  allRefs.forEach((ref) => ref.off());
  allRefs = [];
  console.log('allOff allRefs:', allRefs);
};
