# How to add the overlay in OBS
1. Add a browser to your Scene by right clicking in the (Sources panel in obs) > (Add) > (Browser)
   ![Add Browser](/screenshots/addBrowser.jpg)
   
2. The first window that will popup is the Create/Select Source window. Here you have to click on (Create new) and then (OK). When you
   press ok, a new window will apear. Here you need to make sure the Local File checkbox is checked, then you have to click browse to
   locate the OBSOverlay.html file in the application folder 
   (Your Drive):\[Where the program is located]\resources\app\client\overlay\OBSOverlay.html
   after you have selected the HTML file you have to change the width and height property to 
   Width: 652
   Height: 729
   You can set the FPS to whatever you want and you can leave the Custom CSS as it is then press ok and you are done.
   If the server is running you will see the overlay in OBS.
   
   ![Browser Properties](/screenshots/browserProperties.jpg)
   
   
3. If you have trouble finding the HTML file you can download it (HERE)[https://github.com/AleksanderEvensen/Apex-Legends-Stream-Overlay/releases/tag/Overlay_files]
   just extract the contents and add the OBSOverlay.html file in OBS instead
