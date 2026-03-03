import { ref } from 'vue';

const showLeftSidebar = ref(true);
const showRightToc = ref(true);

export default function useLayout() {
  const toggleLeftSidebar = () => { showLeftSidebar.value = !showLeftSidebar.value; };
  const toggleRightToc = () => { showRightToc.value = !showRightToc.value; };

  return { showLeftSidebar, showRightToc, toggleLeftSidebar, toggleRightToc };
}
