import { useEffect } from "react";

export function withANhub(Component:React.ComponentType<any>) {
  function ANhubComponent(props:any) {
    // 获取组件名称
    const componentName = Component.displayName || Component.name || 'Component';
    console.log('[ANhubInfo] Run times:',1)
    useEffect(()=>{
      console.log(`[ANhubInfo] send info, componentName: ${componentName} ,url:${window.location.href} ,createdCount:1`)
    },[])
    return (
      <Component
        {...props}
      />
    );
  }

  ANhubComponent.isANhub = true;

  return ANhubComponent;
}