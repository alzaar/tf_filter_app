import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function App() {
  const [height, setHeight] = useState(window.innerHeight);
  const [images, setImages] = useState([]);
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setHeight(window.innerHeight);
    });
  }, []);

  function uploadImage(e) {
    e.stopPropagation();
    if (images.length < 2) {
      const file = e.target.files[0];
      const newImages = [...images, file];
      setImages(newImages);
    } else {
      setDisplayError(true);
    }
  }

  function handleUpload(e) {
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData();
    images.forEach((img) => formData.append("files", img));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/", true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log("File uploaded successfully.");
      } else {
        console.error("File upload failed.");
      }
    };
    xhr.send(formData);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: height,
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 15,
        }}
      >
        {images.map(
          (image, i) =>
            image && (
              <img
                key={i}
                src={URL.createObjectURL(image)}
                width="700"
                height="500"
                alt={`uploaded file ${i + 1}`}
              />
            )
        )}
      </div>
      <Button component="label" variant="contained">
        Upload
        <input accept="image/*" onChange={uploadImage} type="file" hidden />
      </Button>
      <Button onClick={handleUpload} variant="contained" color="success">
        Process
      </Button>
      {displayError && (
        <Box component="span" sx={{ display: "block" }}>
          Cannot upload more than two files.
        </Box>
      )}
    </div>
  );
}
