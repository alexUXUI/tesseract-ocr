import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import styles from '../styles/Home.module.css';

import { createWorker } from 'tesseract.js';

export const pngs = [
  'Group2.png',
  'Group3.png',
  'try3.png',
  'try4.png',
  'try5.png',
];

async function prepareData() {
  const worker = createWorker({
    logger: (m) => console.log(m),
  });

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const t0 = performance.now();

  for (let i = 0; i < 20; i++) {
    const {
      data: { text },
    } = await worker.recognize(`/${pngs[1]}`);
    console.log(text);
  }

  const t1 = performance.now();
  console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
  // const {
  //   data: { text },
  // } = await worker.recognize(
  //   'https://tesseract.projectnaptha.com/img/eng_bw.png'
  // );

  // pngs.map((png) => {
  //   return worker.recognize(`./${png}`, 'eng', {
  //     logger: (m) => console.log(m),
  //   });
  // });

  // console.log(text);
  // await worker.terminate();

  // // return Promise.all(tesseractPromises).then((output) => {
  // //   return output;
  // // });

  return Promise.resolve([
    {
      png: 'Group2.png',
      data: {
        text: 'Group 2',
      },
    },
  ]);
}

function useOCRREsults() {
  const [ocrResults, setOCRResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (ocrResults.length === 0) {
        setLoading(true);
        prepareData().then((results) => {
          setOCRResults(results);
          setLoading(false);
        });
      }
    }
  }, []);

  return {
    ocrResults,
    loading,
  };
}

export default function Home() {
  const [fileData, setFileData] = useState(undefined);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFileData(reader.result);
    };
  };

  const defaultFile = {
    title: undefined,
    text: undefined,
  };

  const [fileOutput, setFileOutput] = useState(defaultFile);

  useEffect(() => {
    if (fileData) {
      Tesseract.recognize(fileData, 'eng', {
        // logger: (m) => console.log(m),
      }).then(({ data }) => {
        setFileOutput({
          title: 'uploaded image: ',
          text: `Output text: ${data.text}`,
        });
      });
    }
  }, [fileData]);

  const handleClearFile = () => {
    setFileData(undefined);
    setFileOutput(defaultFile);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>OCR proof of concept</h1>
        <div className={styles.fileUpload}>
          <h2>Upload an image</h2>
          <div className={styles.flex}>
            <input type="file" onChange={handleImageUpload} />
            {fileData && (
              <button className={styles.clear} onClick={handleClearFile}>
                Clear
              </button>
            )}
          </div>

          {fileOutput?.text && (
            <div style={rowStyle}>
              <div style={columnStyle}>
                <h2>Input Image</h2>
                <img src={fileData} alt="uploaded image" height={'300px'} />
              </div>
              <div style={columnStyle}>
                <h2>Output Text</h2>
                <p>{fileOutput.text}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Product Science 💜
        </a>
      </footer>
    </div>
  );
}

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '50%',
  alignItems: 'center',
};

const rowStyle = {
  display: 'flex',
  width: '80%',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0px 0 20px 0',
};

const lineBreakStyle = {
  width: '60%',
  border: '1px solid gray',
  margin: '10px 0 10px 0',
};
