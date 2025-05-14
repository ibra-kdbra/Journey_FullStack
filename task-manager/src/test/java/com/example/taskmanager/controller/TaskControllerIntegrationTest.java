package com.example.taskmanager.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void whenGetTasks_EmptyDb_ShouldReturnEmptyArray() throws Exception {
        mockMvc.perform(get("/api/v1/tasks").with(jwt().jwt(jwt -> jwt.subject("test-user"))))
               .andExpect(status().isOk())
               .andExpect(content().json("[]"));
    }

    @Test
    void whenCreateThenGetTask_ShouldReturnCreated() throws Exception {
        String body = "{\"title\":\"Integration Test\",\"dueDate\":\"2025-07-01\"}";

        // Create
        String location = mockMvc.perform(post("/api/v1/tasks")
                .with(jwt().jwt(jwt -> jwt.subject("int-user")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getHeader("Location");

        // Retrieve
        mockMvc.perform(get(location).with(jwt().jwt(jwt -> jwt.subject("int-user"))))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.title").value("Integration Test"));
    }

    @Test
    void whenAccessOthersTask_ShouldReturnForbidden() throws Exception {
        // Assuming task with ID 1 exists for user 'owner1'
        mockMvc.perform(get("/api/v1/tasks/1").with(jwt().jwt(jwt -> jwt.subject("other-user"))))
               .andExpect(status().isForbidden());
    }
}