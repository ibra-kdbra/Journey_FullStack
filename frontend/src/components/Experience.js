import React from "react";
import { motion } from "framer-motion";

const Experience = () => {
  return (
    <div className="min-h-full bg-white pb-72 pt-48 dark:bg-black">
      <motion.div
        className="container mx-auto p-6 md:p-12"
        initial={{ opacity: 0, scale: 0.75, y: 200 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold">Experience</h1>
        <div className="table_container pt-12">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th>Year</th>
                <th>Company</th>
                <th className="hidden md:block">Position</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2021-2023</td>
                <td>Nika Digital Agency</td>
                <td className="hidden md:block">Frontend Engineer</td>
              </tr>
              <tr>
                <td>2019-2021</td>
                <td>Facebook</td>
                <td className="hidden md:block">Software Engineer</td>
              </tr>
              <tr>
                <td>2016-2019</td>
                <td>Nika Digital Agency</td>
                <td className="hidden md:block">Marketing Manager</td>
              </tr>
              <tr>
                <td>2015-2016</td>
                <td>7Bev Corporation</td>
                <td className="hidden md:block">Marketing Manager</td>
              </tr>
              <tr>
                <td>2009-2010</td>
                <td>UCLA Marketing</td>
                <td className="hidden md:block">Network Administrator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Experience;
